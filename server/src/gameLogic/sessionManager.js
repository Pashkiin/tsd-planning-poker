const { SessionModel } = require("../models/sessionModel");

class SessionManager {
  constructor() {
    this.sessions = new Map(); // mapping: sessionId -> SessionModel
    console.log("SessionManager initialized.");
  }

  createSession(creatorId, sessionName, initialTasksData = []) {
    try {
      const newSession = new SessionModel(
        creatorId,
        sessionName,
        initialTasksData
      );
      this.sessions.set(newSession.sessionId, newSession);
      console.log(`Session created: ${newSession.sessionId} by ${creatorId}`);
      return newSession;
    } catch (error) {
      console.error("Error creating session:", error);
      return null;
    }
  }

  getSession(sessionId) {
    if (!sessionId) return undefined;
    return this.sessions.get(sessionId);
  }

  removeSession(sessionId) {
    if (this.sessions.has(sessionId)) {
      this.sessions.delete(sessionId);
      console.log(`Session removed: ${sessionId}`);
      return true;
    }
    console.warn(`Attempted to remove non-existent session: ${sessionId}`);
    return false;
  }

  addPlayerToSession(sessionId, username, socketId) {
    const session = this.getSession(sessionId);
    if (session) {
      try {
        return session.addPlayer(username, socketId);
      } catch (error) {
        console.error(
          `Error adding player ${username} to session ${sessionId}:`,
          error
        );
        return null;
      }
    }
    console.warn(
      `Session ${sessionId} not found when trying to add player ${username}.`
    );
    return null;
  }

  removePlayerFromSession(sessionId, playerId) {
    const session = this.getSession(sessionId);
    if (session) {
      return session.removePlayer(playerId);
    }
    console.warn(
      `Session ${sessionId} not found when trying to remove player ${playerId}.`
    );
    return false;
  }

  recordVote(sessionId, playerId, cardValue) {
    const session = this.getSession(sessionId);
    if (session) {
      return session.recordVote(playerId, cardValue);
    }
    return false;
  }

  lockPlayerVote(sessionId, playerId) {
    const session = this.getSession(sessionId);
    if (session) {
      return session.lockPlayerVote(playerId);
    }
    return false;
  }

  revealEstimations(sessionId, requestingPlayerId) {
    const session = this.getSession(sessionId);
    if (session) {
      if (session.creatorId !== requestingPlayerId) {
        console.warn(
          `Player ${requestingPlayerId} is not the creator and cannot reveal votes for session ${sessionId}.`
        );
        return null; // Or throw an authorization error
      }
      return session.revealEstimationsForCurrentTask();
    }
    return null;
  }

  resetVotesForCurrentTask(sessionId) {
    const session = this.getSession(sessionId);
    if (session) {
      return session.resetVotesForCurrentTask();
    }
    return false;
  }

  setCurrentTask(sessionId, taskId) {
    const session = this.getSession(sessionId);
    if (session) {
      return session.setCurrentTask(taskId);
    }
    return null;
  }

  addTaskToSession(sessionId, taskName, taskDescription) {
    const session = this.getSession(sessionId);
    if (session) {
      return session.addTask(taskName, taskDescription);
    }
    return null;
  }

  getSessionState(sessionId) {
    const session = this.getSession(sessionId);
    if (session) {
      return session.getSessionState();
    }
    return null;
  }

  // Helper to find which session a socket is part of
  findSessionBySocketId(socketId) {
    for (const session of this.sessions.values()) {
      if (session.players.some((p) => p.socketId === socketId)) {
        return session;
      }
    }
    return null;
  }

  // Helper to find a player by socket ID across all sessions
  findPlayerBySocketId(socketId) {
    for (const session of this.sessions.values()) {
      const player = session.players.find((p) => p.socketId === socketId);
      if (player) {
        return { player, sessionId: session.sessionId };
      }
    }
    return null;
  }
}

// Make SessionManager a singleton
module.exports = new SessionManager();
