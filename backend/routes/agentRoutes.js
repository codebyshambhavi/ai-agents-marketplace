const express = require("express");
const {
	createAgent,
	getAllAgents,
	getAgentById,
	updateAgentRating,
} = require("../controllers/agentController");

const router = express.Router();

// POST /api/agents/create
router.post("/create", createAgent);

// GET /api/agents
router.get("/", getAllAgents);

// GET /api/agents/:id
router.get("/:id", getAgentById);

// PATCH /api/agents/:id/rating
router.patch("/:id/rating", updateAgentRating);

module.exports = router;
