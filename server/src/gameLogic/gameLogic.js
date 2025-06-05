const sessionManager = require("./sessionManager");

function addPlayer(sessionId,userId, username, socketId) {
  if (!sessionId || !username || !socketId || !userId) {
    console.error(
      "sessionId, username, userId and socketId are required to add a player."
    );
    return null;
  }
  return sessionManager.addPlayerToSession(sessionId,userId, username, socketId);
}

function getPlayers(sessionId) {
  const session = sessionManager.getSession(sessionId);
  return session ? session.getPlayers() : null;
}

function selectAndLockVote(sessionId, playerId, cardValue) {
  const session = sessionManager.getSession(sessionId);
  if (session) {
    const voteRecorded = session.recordVote(playerId, cardValue);
    if (voteRecorded) {
      return session.lockPlayerVote(playerId);
    }
  }
  return false;
}

function removePlayer(sessionId, playerId) {
  return sessionManager.removePlayerFromSession(sessionId, playerId);
}

function getSessionState(sessionId) {
  return sessionManager.getSessionState(sessionId);
}

function setCurrentTaskForSession(sessionId, taskId) {
  const success = sessionManager.setCurrentTask(sessionId, taskId);
  if (success) {
    return sessionManager.getSession(sessionId)?.getCurrentTask();
  }
  return null;
}

function resetVotes(sessionId) {
  return sessionManager.resetVotesForCurrentTask(sessionId);
}

function revealEstimations(sessionId, requestingPlayerId) {
  return sessionManager.revealEstimations(sessionId, requestingPlayerId);
}

function createNewSession(creatorId, sessionName, initialTasksData = []) {
  return sessionManager.createSession(creatorId, sessionName, initialTasksData);
}

function getAllActiveSessions() {
  const activeSessions = [];
  for (const session of sessionManager.sessions.values()) {
    activeSessions.push({
      sessionId: session.sessionId,
      sessionName: session.sessionName,
      creatorId: session.creatorId,
      playerCount: session.players.length,
      currentTaskName: session.getCurrentTask()
        ? session.getCurrentTask().name
        : "No active task",
    });
  }
  return activeSessions;
}

module.exports = {
  addPlayer,
  getPlayers,
  selectAndLockVote,
  removePlayer,
  getSessionState,
  setCurrentTaskForSession,
  resetVotes,
  revealEstimations,
  createNewSession,
  getAllActiveSessions,
};
