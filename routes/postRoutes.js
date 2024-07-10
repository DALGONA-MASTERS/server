const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  addComment,
  editComment,
  deleteComment,
  likePost,
  deletePost,
} = require("../controllers/PostController");
const { checkUser } = require("../middleware/AuthMiddleware");
const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({ storage });

const router = require("express").Router();
// CRUD post
router.get("/", checkUser, getAllPosts);
router.get("/:id", checkUser, getPostById);
router.post("/", checkUser, upload.single("picture"), createPost);
router.patch("/:id", checkUser, updatePost);
router.delete("/:id/", checkUser, deletePost);
//like and unlike posts
router.patch("/:id/like", checkUser, likePost);
// Comments
router.post("/:id/comments", checkUser, addComment);
router.patch("/:id/comments/:commentId", checkUser, editComment);
router.delete("/:id/comments/:commentId", checkUser, deleteComment);
// Export the router

module.exports = router;
