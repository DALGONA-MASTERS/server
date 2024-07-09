const {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    addComment,
    editComment,
    deleteComment,
    likePost,
  } = require("../controllers/PostController");
  const { checkUser } = require("../middleware/AuthMiddleware");
  
  const router = require("express").Router();
  // CRUD post
  router.get("/", checkUser, getAllPosts);
  router.get("/:id", checkUser, getPostById);
  router.post("/", checkUser, createPost);
  router.patch("/:id", checkUser, updatePost);
  //like and unlike posts
  router.patch("/:id/like", checkUser, likePost);
  // Comments
  router.post("/:id/comments", checkUser, addComment);
  router.patch("/:id/comments/:commentId", checkUser, editComment);
  router.delete("/:id/comments/:commentId", checkUser, deleteComment);
  // Export the router
  
  module.exports = router;
  