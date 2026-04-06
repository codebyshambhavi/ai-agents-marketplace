const express = require("express");
const { createAgent, getAllAgents } = require("../controllers/agentController");

const router = express.Router();

// POST /api/agents/create
router.post("/create", createAgent);

// GET /api/agents
router.get("/", getAllAgents);

module.exports = router;
