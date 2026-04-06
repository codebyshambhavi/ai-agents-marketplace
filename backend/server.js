const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();
const PORT = 5000;

app.use(express.json());

const agentRoutes = require("./routes/agentRoutes");
app.use("/api/agents", agentRoutes);

// existing route
app.get("/", (req, res) => {
  res.send("API is running");
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();