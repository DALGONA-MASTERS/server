const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  addComment,
  editComment,
  deleteComment,
  likePost,
<<<<<<< HEAD
  deletePost,
} = require("../controllers/PostController");
const { checkUser } = require("../middleware/AuthMiddleware");
const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({ storage });
=======
} = require("../controller/postController");
const { checkUser } = require("../middleware/authMiddleware");
>>>>>>> a4499a909691ed513a890b7c7cae34ee18bdb0f2

const router = require("express").Router();
// CRUD post
router.get("/", checkUser, getAllPosts);
router.get("/:id", checkUser, getPostById);
<<<<<<< HEAD
router.post("/", checkUser, upload.single("picture"), createPost);
router.patch("/:id", checkUser, updatePost);
router.delete("/:id/", checkUser, deletePost);
=======
router.post("/", checkUser, createPost);
router.patch("/:id", checkUser, updatePost);
>>>>>>> a4499a909691ed513a890b7c7cae34ee18bdb0f2
//like and unlike posts
router.patch("/:id/like", checkUser, likePost);
// Comments
router.post("/:id/comments", checkUser, addComment);
router.patch("/:id/comments/:commentId", checkUser, editComment);
router.delete("/:id/comments/:commentId", checkUser, deleteComment);
// Export the router

module.exports = router;
