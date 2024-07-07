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
    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: maxAge,
    });
    res.cookie("jwt", token, { httpOnly: true, maxAge });

    res.send("user :" + user + "\ntoken :" + token);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
