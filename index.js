const express = require('express');
const connectDB = require("./config/db");
require('dotenv').config({ path: './config/.env' }); // Spécifie le chemin vers .env dans le dossier config
const cookieParser = require("cookie-parser");

//Routes initialisation
const userRoutes = require('./routes/UserRoutes');
const eventRoutes = require('./routes/EventRoutes');
const contributionRoutes = require('./routes/ContributionRoutes');
const postRoutes = require('./routes/PostRoutes');
const statsRoutes = require('./routes/StatsRoutes');
const messageRoutes = require('./routes/messageRoutes');
const cors = require('cors');

const app = express();
const port = process.env.PORT;


// DB connexion
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  exposedHeaders: ['jwt']
}));

// Routes
app.use('/users', userRoutes);
app.use('/events', eventRoutes);
app.use('/contributions', contributionRoutes);
app.use('/posts', postRoutes);
app.use('/stats', statsRoutes);
app.use('/messages', messageRoutes);
app.use("/*", (req, res) => res.send("<h1>404 not found</h1>"))
app.get("/", (req, res) => {
  res.send("API is running...");
});

//Server Launch
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
