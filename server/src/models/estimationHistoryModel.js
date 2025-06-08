const mongoose = require("mongoose");

const estimationHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sessionId: { type: String, required: true },
    storyTitle: { type: String, required: true },
    selectedCardValue: { type: String, required: true },
    date: { type: Date, default: Date.now },
    teammates: [{ type: String }], // Optional: usernames or IDs of others
    allVotes: [{ username: String, card: String }] // Optional: team summary
});

module.exports = mongoose.model("EstimationHistory", estimationHistorySchema);
