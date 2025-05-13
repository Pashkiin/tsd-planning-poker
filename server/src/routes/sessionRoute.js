const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/sessionController");

// POST /api/sessions - Create a new session
router.post("/", sessionController.createSession);

// GET /api/sessions - List all active sessions
router.get("/", sessionController.listSessions);

// GET /api/sessions/:sessionId - Get details for a specific session
router.get("/:sessionId", sessionController.getSessionDetails);

module.exports = router;
