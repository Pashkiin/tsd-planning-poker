const EstimationHistory = require("../models/estimationHistoryModel");

const getUserHistory = async (req, res) => {
    try {
        const userId = req.params.userId; // or use token auth in req.user.id

        const history = await EstimationHistory.find({ userId }).sort({ date: -1 });
        res.status(200).json(history);
    } catch (err) {
        console.error("❌ Error fetching history:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { getUserHistory };
