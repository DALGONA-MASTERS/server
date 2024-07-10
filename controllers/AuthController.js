const userModel = require("../models/User");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const sendVerificationCode = require("../utils/mailer");
const bcrypt = require("bcrypt");
const A2FModel = require('../models/A2F');

const maxAge = 24 * 60 * 60 * 1000 * 30; // 1 month

// SignUp
module.exports.signUp = async (req, res) => {
  const { email, password, username } = req.body;
  try {
    let user = await userModel.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "User already exists. Please login instead." });
    }
    const verificationCode = generateRandomString(6);
    const hashedCode = await bcrypt.hash(verificationCode, 10);
    const hashedPassword = await bcrypt.hash(password, 10);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await A2FModel.create({ email, code: hashedCode, username, password: hashedPassword, expiresAt });

    await sendVerificationCode(email, verificationCode);

    res.status(201).json({ message: "Verification code sent to your email. Please verify to complete registration." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Verify A2F Code
module.exports.verifyA2FCode = async (req, res) => {
  const { email, code } = req.body;
  try {
    const a2fEntry = await A2FModel.findOne({ email });
    if (!a2fEntry) {
      return res.status(400).json({ message: 'Invalid verification code or code expired.' });
    }

    const isMatch = await bcrypt.compare(code, a2fEntry.code);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }

    // Verification successful, create the user
    const user = new userModel({ email, username: a2fEntry.username, password: a2fEntry.password });
    await user.save();

    // Delete the A2F entry as it's no longer needed
    await A2FModel.deleteOne({ email });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, { expiresIn: maxAge });

    res.cookie('jwt', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.status(200).json({ user: { id: user._id, email: user.email, username: user.username } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.login(email, password);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: maxAge,
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.cookie("jwt", token, { httpOnly: true, maxAge });
    // add token to json res
    res.json({ user: userObj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

function generateRandomString(length) {
  const characters = '0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

module.exports.googleLogin = async (req, res) => {
  const { token } = req.body;
  try {
    // Verify the token with Google
    const googleResponse = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    const payload = googleResponse.data;
    // Extract user information
    const email = payload.email;
    const fullName = payload.name;
    const picture = payload.picture;

    // Find or create the user in your database
    let user = await userModel.findOne({ email });

    if (!user) {
      // Generate a random password
      const randomPassword = generateRandomString(10);

      user = new userModel({
        email: email,
        username: fullName,
        profilePic: picture,
        password: randomPassword, // Assigner le mot de passe aléatoire
      });
      await user.save();
    }

    // Generate JWT token
    const jwtToken = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: maxAge,
    });

    res.cookie('jwt', jwtToken, { httpOnly: true, maxAge });
    res.status(200).json({
      message: 'Google login successful',
      user: { id: user._id, email: user.email },
    });
  } catch (error) {
    console.error('Error verifying token with Google:', error);
    res.status(400).json({ error: 'Invalid token' });
  }
};

module.exports.logout = async (req, res) => {
  // Clear the JWT cookie
  res.clearCookie('jwt');
  res.status(200).json({ message: 'Logout successful' });
};
