const gameLogic = require("../gameLogic/gameLogic");

const voteCard = (req, res) => {
  const { sessionId, userId, cardValue } = req.body;

  if (!sessionId || !userId || cardValue === undefined) {
    // cardValue can be null
    return res.status(400).json({
      error: "Session ID, User ID, and Card Value are required for voting.",
    });
  }

  const success = gameLogic.selectAndLockVote(sessionId, userId, cardValue);

  if (success) {
    const updatedSessionState = gameLogic.getSessionState(sessionId);
    res.json({
      success: true,
      message: "Vote recorded and locked.",
      sessionState: updatedSessionState,
    });
  } else {
    res.status(404).json({
      error:
        "Failed to record vote. Player or session not found, or vote already locked.",
    });
  }
};

const getGameSessionDetails = (req, res) => {
  const { sessionId } = req.query;

  if (!sessionId) {
    return res.status(400).json({ error: "Session ID is required." });
  }

  const sessionState = gameLogic.getSessionState(sessionId);
  if (sessionState) {
    res.json(sessionState);
  } else {
    res.status(404).json({ error: "Session not found." });
  }
};

const updateTaskForSession = (req, res) => {
  const { sessionId, taskId, taskName } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: "Session ID is required." });
  }
  if (!taskId && !taskName) {
    return res.status(400).json({
      error:
        "Either Task ID (to set existing) or Task Name (to create new and set) is required.",
    });
  }

  let success = false;
  let message = "";
  let updatedTask;

  if (taskId) {
    // Set an existing task as current
    updatedTask = gameLogic.setCurrentTaskForSession(sessionId, taskId);
    success = !!updatedTask;
    message = success
      ? `Task ${updatedTask.name} is now active.`
      : "Failed to set current task.";
  } else if (taskName) {
    // Create a new task and set it as current
    const session = gameLogic.sessionManager.getSession(sessionId);
    if (session) {
      const newTask = session.addTask(taskName, req.body.taskDescription || "");
      if (newTask) {
        updatedTask = session.setCurrentTask(newTask.id);
        success = !!updatedTask;
        message = success
          ? `New task "${newTask.name}" created and set as active.`
          : "Failed to create or set new task.";
      } else {
        message = "Failed to create new task.";
      }
    } else {
      message = "Session not found.";
    }
  }

  if (success) {
    // Notify clients via WebSocket
    const updatedSessionState = gameLogic.getSessionState(sessionId);
    res.json({
      success: true,
      message: message,
      sessionState: updatedSessionState,
    });
  } else {
    res.status(400).json({ error: message || "Failed to update task." });
  }
};

const resetVotesHandler = (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res
      .status(400)
      .json({ error: "Session ID is required to reset votes." });
  }

  const success = gameLogic.resetVotes(sessionId);
  if (success) {
    // Notify clients via WebSocket
    const updatedSessionState = gameLogic.getSessionState(sessionId);
    res.json({
      success: true,
      message: "Głosy zostały zresetowane.",
      sessionState: updatedSessionState,
    });
  } else {
    res
      .status(404)
      .json({ error: "Session not found or failed to reset votes." });
  }
};

// Endpoint for revealing votes by creator
const revealVotesHandler = (req, res) => {
  const { sessionId, userId } = req.body;
  if (!sessionId || !userId) {
    return res
      .status(400)
      .json({ error: "Session ID and User ID (creator) are required." });
  }
  const result = gameLogic.revealEstimations(sessionId, userId);
  if (result) {
    // Notify clients via WebSocket
    const updatedSessionState = gameLogic.getSessionState(sessionId);
    res.json({
      success: true,
      message: "Votes revealed.",
      estimations: result,
      sessionState: updatedSessionState,
    });
  } else {
    res.status(403).json({
      error:
        "Failed to reveal votes. Session not found or user not authorized.",
    });
  }
};

module.exports = {
  voteCard,
  getGameSessionDetails,
  updateTaskForSession,
  resetVotesHandler,
  revealVotesHandler,
};
