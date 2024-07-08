const {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    likePost,
    addComment
} = require("../controllers/PostController");

const router = require("express").Router();

const { checkUser } = require("../middleware/AuthMiddleware");

router.get("/", checkUser, getAllPosts);
router.get("/:id", checkUser, getPostById);
router.post("/", checkUser, createPost);
router.patch("/:id", checkUser, updatePost);    
router.patch("/:id/like", checkUser, likePost);
router.post("/:id/comments", checkUser, addComment);

module.exports = router;
