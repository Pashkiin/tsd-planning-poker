const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");

// POST /api/game/vote - Player votes in a specific session
// Body: { sessionId, userId, cardValue }
router.post("/vote", gameController.voteCard);

// GET /api/game/session?sessionId=xxx - Get full state of a specific game session
// This might be superseded by GET /api/sessions/:sessionId
router.get("/session", gameController.getGameSessionDetails);

// POST /api/game/task - Set/update the current task for a session
// Body: { sessionId, taskId } or { sessionId, taskName, taskDescription }
router.post("/task", gameController.updateTaskForSession);

// POST /api/game/reset - Reset votes for the current task in a session
// Body: { sessionId }
router.post("/reset", gameController.resetVotesHandler);

// POST /api/game/reveal - Creator reveals votes for the current task
// Body: { sessionId, userId (creator's ID) }
router.post("/reveal", gameController.revealVotesHandler);

module.exports = router;
