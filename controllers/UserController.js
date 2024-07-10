const { isFullWidth } = require("validator");
const userModel = require("../models/User");
const bcrypt = require("bcrypt");
module.exports.getAll = async (req, res) => {
  try {
    const users = await userModel.find().select("-passord");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getLoggedInUser = async (req, res) => {
  try {
    // Récupérer l'utilisateur à partir de req.user (si vous l'avez configuré lors de l'authentification)
    const user_id = req.user.id;
    const user = await userModel.findById(user_id);
    console.log(user.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      profilePic: user.profilePic,
      fullName: user.fullName,
      bio: user.bio,
      liked : user.liked,
      events : user.events,
      
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports.getUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id).select("-passord");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports.updateUser = async (req, res) => {
  try {
    if (req.body.password) {
      req.body.passord = await bcrypt.hash(req.body.password, 10);
    }
    const user = await userModel
      .findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      })
      .select("-passord");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deleteUser = async (req, res) => {
  try {
    const user = await userModel.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
