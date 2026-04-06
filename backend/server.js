const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware order: CORS first, then JSON parser.
app.use(cors());
app.use(express.json());

const agentRoutes = require("./routes/agentRoutes");
app.use("/api/agents", agentRoutes);

// existing route
app.get("/", (req, res) => {
  res.send("API is running");
});

const startServer = async () => {
  try {
    console.log("Starting server...");
    const dbConnected = await connectDB();

    if (!dbConnected) {
      console.warn("Database is not connected. Check MONGO_URI for full functionality.");
    }

    app.listen(PORT, () => {
      console.log(`Server started successfully on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();