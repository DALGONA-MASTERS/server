const jwt = require("jsonwebtoken");

//middleware to check for user token
exports.checkUser = (req, res, next) => {
  const token = req.headers["jwt"] ? req.headers["jwt"] : null;
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    console.log("error : " + error.message);
    return res.status(403).json({ message: "Invalid token" });
  }
};
