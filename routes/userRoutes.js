const { signUp, login, googleLogin, verifyA2FCode, logout} = require("../controllers/AuthController");
const {
  getAll,
  updateUser,
  deleteUser,
  getLoggedInUser
} = require("../controllers/UserController");
const { checkUser } = require("../middleware/AuthMiddleware");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = require("express").Router();

//authentication
router.post("/signUp", signUp);
router.post("/login", login);
router.post("/google-login", googleLogin); // Route for Google login
router.post("/verify-code", verifyA2FCode);
router.post("/logout", checkUser,logout);


//other routes ONLY for admin
router.get("/", checkUser,getLoggedInUser);
router.get("/getAll", checkUser,getAll);
router.patch("/:id", checkUser, upload.single("profilePic"), updateUser);
router.delete("/:id", checkUser,deleteUser);

module.exports = router;