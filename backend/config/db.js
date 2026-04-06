const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("MONGO_URI is not set. Server will run without database connection.");
    return false;
  }

  if (mongoUri.includes("localhost") || mongoUri.includes("127.0.0.1")) {
    console.error("MONGO_URI should use a cloud MongoDB connection string for production.");
    return false;
  }

  try {
    const connection = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected successfully: ${connection.connection.host}`);
    return true;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
