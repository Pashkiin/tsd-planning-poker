const User = require("../models/userModel");

// Get all registered users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, "-passwordHash"); // Exclude passwordHash from response
        res.status(200).json(users);
    } catch (err) {
        console.error("❌ Error fetching users:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { getAllUsers };
