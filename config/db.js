const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME, //DB_NAME in env
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);

    // Log in EVENT Handler
    conn.connection.on("connected", () => {
      console.log("Mongoose connected to DB");
    });

    conn.connection.on("error", (err) => {
      console.error(`Mongoose connection error: ${err}`);
    });

    conn.connection.on("disconnected", () => {
      console.log("Mongoose disconnected from DB");
    });
  } catch (err) {
    console.error(`Failed to connect to MongoDB: ${err.message}`);
    process.exit(1);
  }
};

// Log out EVENT
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("Mongoose connection closed on app termination");
  process.exit(0);
});

module.exports = connectDB;
