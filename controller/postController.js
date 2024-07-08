const postModule = require("../models/Post");

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
    const post = await postModule.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    // checking if the user is allowed to update
    if (post.author.toString() !== req.user)
      return res
        .status(403)
        .json({ message: "Unauthorized to update this post" });
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
exports.likePost = async (req, res) => {
  try {
    // Find the post by ID
    const post = await postModule.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Check
    const hasLiked = post.likers.includes(req.user);

    // If the user has liked the post, remove the like, otherwise add it
    const updatedPost = await postModule.findByIdAndUpdate(
      req.params.id,
      hasLiked
        ? { $pull: { likers: req.user }, $inc: { likesCount: -1 } }
        : { $addToSet: { likers: req.user }, $inc: { likesCount: +1 } },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports.deletePost = async (req, res) => {
  try {
    const post = await postModule.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== req.user)
      return res
        .status(403)
        .json({ message: "Unauthorized to update this post" });

    const deletedPost = await postModule.findByIdAndDelete(req.params.id);
    res.status(200).json(deletedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports.addComment = async (req, res) => {
  const postId = req.params.id;
  const { comment } = req.body;

  try {
    let post = await postModule.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Publication non trouvée." });
    }

    const newComment = {
      commenter: req.user,
      comment,
    };

    post.comments.push(newComment);
    await post.save();
    res.json(post);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Erreur Serveur");
  }
};
module.exports.editComment = async (req, res) => {
  console.log(req.params);
  const postId = req.params.id;
  const { commentId } = req.params;
  const { comment } = req.body;
  try {
    const post = await postModule.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const commentIndex = post.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );
    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }
    post.comments[commentIndex].comment = comment;
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports.deleteComment = async (req, res) => {
  const postId = req.params.id;
  const { commentId } = req.params;
  try {
    const post = postModule.findById(postId);
    if (!post) return res.status(404).json({ message: "post not found" });
    const commentIndex = post.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );
    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }
    post.comments.splice(commentIndex, 1);
    await post.save();
    res.json({ post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
