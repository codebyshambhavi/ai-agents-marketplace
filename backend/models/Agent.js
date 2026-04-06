const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Agent name is required"],
		trim: true,
	},
	description: {
		type: String,
		default: "",
		trim: true,
	},
	category: {
		type: String,
		default: "",
		trim: true,
	},
	rating: {
		type: Number,
		min: [1, "Rating must be at least 1"],
		max: [5, "Rating cannot be more than 5"],
		default: 1,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model("Agent", agentSchema);
