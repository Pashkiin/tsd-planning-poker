const gameLogic = require("../gameLogic/gameLogic");

const createSession = async (req, res) => {
  const { creatorId, sessionName, tasks } = req.body;

  if (!creatorId) {
    return res.status(400).json({
      message: "Creator ID is required",
    });
  }
  if (!sessionName) {
    return res.status(400).json({ message: "Session name is required." });
  }

  // Validate tasks if provided
  const initialTasksData = Array.isArray(tasks)
    ? tasks.map((t) => ({ name: t.name, description: t.description || "" }))
    : [];

  try {
    const newSession = gameLogic.createNewSession(
      creatorId,
      sessionName,
      initialTasksData
    );
    if (newSession) {
      // Return details of the created session
      res.status(201).json({
        message: "Session created successfully.",
        sessionId: newSession.sessionId,
        sessionName: newSession.sessionName,
        creatorId: newSession.creatorId,
        // Return the initial session state
        sessionState: gameLogic.getSessionState(newSession.sessionId),
      });
    } else {
      res.status(500).json({ message: "Failed to create session." });
    }
  } catch (error) {
    console.error("Error in createSession controller:", error);
    res.status(500).json({
      message: "Internal server error while creating session.",
      error: error.message,
    });
  }
};

const listSessions = async (req, res) => {
  try {
    const activeSessions = gameLogic.getAllActiveSessions();
    res.status(200).json(activeSessions);
  } catch (error) {
    console.error("Error in listSessions controller:", error);
    res.status(500).json({
      message: "Internal server error while listing sessions.",
      error: error.message,
    });
  }
};

const getSessionDetails = async (req, res) => {
  const { sessionId } = req.params;
  if (!sessionId) {
    return res.status(400).json({ message: "Session ID is required." });
  }
  try {
    const sessionState = gameLogic.getSessionState(sessionId);
    if (sessionState) {
      res.status(200).json(sessionState);
    } else {
      res.status(404).json({ message: "Session not found." });
    }
  } catch (error) {
    console.error(
      `Error in getSessionDetails controller for ${sessionId}:`,
      error
    );
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

module.exports = {
  createSession,
  listSessions,
  getSessionDetails,
};
