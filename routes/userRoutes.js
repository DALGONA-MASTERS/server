const { signUp, login } = require("../controllers/AuthController");
const {
  getAll,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/UserController");
const { checkUser } = require("../middleware/AuthMiddleware");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = require("express").Router();

//authentication
router.post("/signUp", signUp);
router.post("/login", login);

//other routes
router.get("/", getAll);
router.get("/:id", checkUser, getUser);
router.patch("/:id", checkUser, upload.single("profilePic"), updateUser);
router.delete("/:id", checkUser, deleteUser);
module.exports = router;
