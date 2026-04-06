const Agent = require("../models/Agent");

const createAgent = async (req, res) => {
  try {
    const { name, description, category, rating } = req.body;

    const agent = await Agent.create({
      name,
      description,
      category,
      rating,
    });

    return res.status(201).json({
      success: true,
      message: "Agent created successfully",
      data: agent,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create agent",
      error: error.message,
    });
  }
};

const getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: agents.length,
      data: agents,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch agents",
      error: error.message,
    });
  }
};

module.exports = {
  createAgent,
  getAllAgents,
};