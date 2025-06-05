const bcrypt = require("bcrypt");
const User = require("../models/userModel");

const registerUser = async (req, res) => {
    try {
        const { username, email, password, acceptedPolicy } = req.body;

        if (!acceptedPolicy) {
            return res.status(400).json({ error: "You must accept the privacy policy." });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(409).json({ error: "A user with the provided email or username already exists." });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = await User.create({ username, email, passwordHash, acceptedPolicy });

        res.status(201).json({ message: "Registration successful", userId: newUser._id });
    } catch (err) {
        console.error("❌ Registration error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        console.log(`User '${user.username}' logged in, assigned ID: ${user._id}`);

        // Match the response shape of loginPlayer
        res.status(200).json({
            userId: user._id,
            username: user.username
        });
    } catch (err) {
        console.error("❌ Login error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};


module.exports = {
    registerUser,
    loginUser
};