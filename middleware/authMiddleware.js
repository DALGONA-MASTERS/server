const jwt = require("jsonwebtoken");

//middleware to check for user token
exports.checkUser = (req, res, next) => {
  const token = req.cookies ? req.cookies.jwt : null;
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = decoded.id;

    next();
  } catch (error) {
    console.log("error : " + error.message);
    return res.status(403).json({ message: "Invalid token" });
  }
};
exports.ChechAuthor = function (req, res, next) {
  // Check if the user making the request is the author of the post
  const userId = req.user;
  const authorId = req.params.id;
  if (userId === authorId) {
    next();
  }
  return res
    .status(401)
    .json({ message: "You are not authorized to perform this action." });
};
