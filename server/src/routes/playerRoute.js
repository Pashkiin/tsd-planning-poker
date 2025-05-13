const express = require("express");
const router = express.Router();
const playerController = require("../controllers/playerController.js");

// POST /api/player/login - User logs in (gets a user profile ID)
router.post("/login", playerController.loginPlayer);

// GET /api/player/players?sessionId=xxx - Fetches players for a specific session
router.get("/players", playerController.fetchPlayersInSession);

module.exports = router;
