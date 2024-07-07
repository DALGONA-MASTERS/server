const { signUp, login } = require("../controller/authController");
const {
  getAll,
  getUser,
  updateUser,
  deleteUser,
} = require("../controller/userController");

const router = require("express").Router();

//authentication
router.post("/signUp", signUp);
router.post("/login", login);

//other routes
router.get("/", getAll);
router.get("/:id", getUser);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);
module.exports = router;
