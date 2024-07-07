const userModel = require("../models/User");
module.exports.getAll = async (req, res) => {
  try {
    const users = await userModel.find().select("-passord");
    res.status(200).json(users);
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
