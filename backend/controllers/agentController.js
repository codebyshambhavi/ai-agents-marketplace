const Agent = require("../models/Agent");

const createAgent = async (req, res) => {
  try {
    const { name, description, category, rating } = req.body;
    const normalizedRating =
      rating === undefined || rating === null || rating === ""
        ? undefined
        : Number(rating);

    const agent = await Agent.create({
      name,
      description,
      category,
      rating: normalizedRating,
    });

    return res.status(201).json({
      success: true,
      message: "Agent created successfully",
      data: agent,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid agent data",
        error: error.message,
      });
    }

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

const getAgentById = async (req, res) => {
  try {
    const { id } = req.params;
    const agent = await Agent.findById(id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: agent,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid agent ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch agent",
      error: error.message,
    });
  }
};

const updateAgentRating = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedRating = Number(req.body.rating);

    if (Number.isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a number between 1 and 5",
      });
    }

    const updatedAgent = await Agent.findByIdAndUpdate(
      id,
      { rating: parsedRating },
      { new: true, runValidators: true }
    );

    if (!updatedAgent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Rating updated successfully",
      data: updatedAgent,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid rating update",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update rating",
      error: error.message,
    });
  }
};

module.exports = {
  createAgent,
  getAllAgents,
  getAgentById,
  updateAgentRating,
};