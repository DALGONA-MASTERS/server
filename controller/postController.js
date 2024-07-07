const postModule = require("../models/Post");
// const multer = require("multer");
// const { GridFsStorage } = require("multer-gridfs-storage");
module.exports.getAllPosts = async (req, res) => {
  try {
    const posts = await postModule.find({});
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getPostById = async (req, res) => {
  try {
    const post = await postModule.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createPost = async (req, res) => {
  const post = new postModule(req.body);
  try {
    const result = await post.save();
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
module.exports.updatePost = async (req, res) => {
  try {
    const updatedPost = await postModule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedPost)
      return res.status(404).json({ message: "Post not found" });
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports.likePost = async (req, res) => {
  const { likerId } = req.body;
  try {
    const updatedPost = await postModule.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { likes: likerId } },
      { new: true }
    );
    if (!updatedPost)
      return res.status(404).json({ message: "Post not found" });
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
