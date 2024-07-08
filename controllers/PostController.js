const postModule = require("../models/Post");
// const multer = require("multer");
// const { GridFsStorage } = require("multer-gridfs-storage");
exports.getAllPosts = async (req, res) => {
    try {
      const posts = await postModule.find({});
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await postModule.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPost = async (req, res) => {
  const { content } = req.body;
  try {
    const newPost = new postModule({
      content,
      author: req.user.id 
    });
    await newPost.save();
    res.json(newPost);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erreur Serveur');
  }
};

exports.updatePost = async (req, res) => {
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

exports.likePost = async (req, res) => {
  try {
      // Find the post by ID
      const post = await postModule.findById(req.params.id);
      if (!post) return res.status(404).json({ message: "Post not found" });

      // Check if the user has already liked the post
      const hasLiked = post.likes.includes(req.user.id);

      // If the user has liked the post, remove the like, otherwise add it
      const updatedPost = await postModule.findByIdAndUpdate(
          req.params.id,
          hasLiked ? { $pull: { likes: req.user.id } } : { $addToSet: { likes: req.user.id } },
          { new: true }
      );

      res.status(200).json(updatedPost);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};


exports.addComment = async (req, res) => {
  const postId = req.params.id;
  const { comment } = req.body;

  try {
    let post = await postModule.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Publication non trouvée.' });
    }

    const newComment = {
      commenter: req.user.id,
      comment
    };

    post.comments.push(newComment);
    await post.save();
    res.json(post);

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erreur Serveur');
  }
};
