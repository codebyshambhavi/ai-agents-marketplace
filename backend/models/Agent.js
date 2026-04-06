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
		default: 0,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model("Agent", agentSchema);
