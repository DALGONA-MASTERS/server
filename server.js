const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config({ path: "./config/.env" });
const userRoutes = require("./routes/userRoutes");

const app = express();
const port = process.env.PORT;

// DB connexion
connectDB();

app.use(express.json());
//routes

app.use("/api/users", userRoutes);
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
