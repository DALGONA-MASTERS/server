const {
  getAllPosts,
  createPost,
  updatePost,
} = require("../controller/postController");
const { checkUser } = require("../middleware/authMiddleware");

const router = require("express").Router();

router.get("/", checkUser, getAllPosts);
router.post("/", createPost);
router.patch("/:id", updatePost);

module.exports = router;
