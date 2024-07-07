const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config({ path: "./config/.env" });
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");

const app = express();
const port = process.env.PORT;

// DB connexion
connectDB();

app.use(express.json());
app.use(cookieParser());
//routes

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
