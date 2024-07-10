const userModel = require("../models/User");
const jwt = require("jsonwebtoken");
//signUp
module.exports.signUp = async (req, res) => {
  const { email, password } = req.body;
  try {
    const newUser = new userModel({ email, password });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

//signIn
//token expiry variable
const maxAge = 24 * 60 * 60 * 1000; // 1 day
module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.login(email, password);
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });
    // send the user without sending the password

    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: maxAge,
    });

    // in the headers add jwt with value token
    res.cookie("jwt", token, { httpOnly: true, maxAge });
<<<<<<< HEAD:controllers/AuthController.js

=======
>>>>>>> a4499a909691ed513a890b7c7cae34ee18bdb0f2:controller/authController.js
    res.json({ user: { id: user._id, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
