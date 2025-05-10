const sessionManager = require("../gameLogic/sessionManager");
const { broadcastSessionUpdate } = require("./socketHelper");

const socketPlayerMap = new Map(); // Map player to his socket

function initializeWebSocket(io, socket) {
  console.log(`WebSocket handlers initializing for socket: ${socket.id}`);

  // Event: Player attempts to join a session
  socket.on("joinSession", async (data) => {
    const { sessionId, userId, username } = data;
    console.log(`➡️ Received joinSession request:`, data);

    if (!sessionId || !userId || !username) {
      socket.emit("joinError", {
        message: "Session ID, User ID, and Username are required to join.",
      });
      console.error(`joinSession failed for ${socket.id}: Missing data.`);
      return;
    }

    const session = sessionManager.getSession(sessionId);
    if (!session) {
      socket.emit("joinError", {
        message: `Session with ID ${sessionId} not found.`,
      });
      console.error(
        `joinSession failed for ${socket.id}: Session ${sessionId} not found.`
      );
      return;
    }

    // Add player to the session model or update socketId if rejoining
    const player = sessionManager.addPlayerToSession(
      sessionId,
      username,
      socket.id
    );

    if (!player) {
      socket.emit("joinError", { message: "Failed to add player to session." });
      console.error(
        `joinSession failed for ${socket.id}: Could not add player ${username} to session ${sessionId}.`
      );
      return;
    }

    // Store mapping for this socket
    socketPlayerMap.set(socket.id, {
      playerId: player.id,
      sessionId: sessionId,
      username: player.username,
    });

    socket.join(sessionId);
    console.log(
      `Socket ${socket.id} (Player ${player.username}, ID ${player.id}) joined session room: ${sessionId}`
    );

    socket.emit("joinedSession", {
      message: `Successfully joined session: ${session.sessionName}`,
      sessionId: sessionId,
      playerId: player.id, // Actual PlayerModel ID
      sessionState: sessionManager.getSessionState(sessionId), // Initial state
    });

    // Broadcast updated session state to everyone
    broadcastSessionUpdate(io, sessionId);
  });

  // Event: Player submits a vote
  socket.on("submitVote", (data) => {
    const { cardValue } = data;
    const playerInfo = socketPlayerMap.get(socket.id);

    if (!playerInfo) {
      socket.emit("voteError", {
        message:
          "Error submitting vote: You are not properly joined to a session.",
      });
      console.error(
        `submitVote error: Socket ${socket.id} not found in socketPlayerMap.`
      );
      return;
    }

    const { playerId, sessionId } = playerInfo;
    if (cardValue === undefined) {
      socket.emit("voteError", {
        message: "Error submitting vote: Card value is missing.",
      });
      console.error(
        `submitVote error for player ${playerId} in session ${sessionId}: Missing cardValue.`
      );
      return;
    }

    console.log(
      `Player ${playerId} in session ${sessionId} submitted vote: ${cardValue}`
    );

    const success = sessionManager.recordVote(sessionId, playerId, cardValue);
    let lockSuccess = false;
    if (success) {
      lockSuccess = sessionManager.lockPlayerVote(sessionId, playerId);
    }

    if (success && lockSuccess) {
      socket.emit("voteConfirmed", {
        message: "Your vote has been submitted and locked.",
        cardValue,
      });
      broadcastSessionUpdate(io, sessionId); // Notify everyone
    } else {
      const session = sessionManager.getSession(sessionId);
      const player = session?.getPlayer(playerId);
      let errorMessage = "Failed to submit vote.";
      if (session && player && player.hasLockedVote) {
        errorMessage = "Your vote is already locked for this round.";
      } else if (!session) {
        errorMessage = "Session not found.";
      } else if (!player) {
        errorMessage = "Player not found in session.";
      }
      socket.emit("voteError", { message: errorMessage });
      console.error(
        `submitVote failed for player ${playerId} in session ${sessionId}. Success: ${success}, LockSuccess: ${lockSuccess}`
      );
    }
  });

  // Event: Player requests to clear their vote
  socket.on("clearMyVote", () => {
    const playerInfo = socketPlayerMap.get(socket.id);
    if (!playerInfo) {
      socket.emit("voteError", {
        message: "Error clearing vote: Not joined to a session.",
      });
      return;
    }
    const { playerId, sessionId } = playerInfo;
    const session = sessionManager.getSession(sessionId);
    const player = session?.getPlayer(playerId);

    if (session && player) {
      // Only allow clearing if votes are not revealed
      const currentTask = session.getCurrentTask();
      if (currentTask && !currentTask.revealed) {
        player.resetVote(); // Resets selectedCardValue and hasLockedVote on PlayerModel
        if (currentTask.estimations[playerId] !== undefined) {
          delete currentTask.estimations[playerId];
        }
        console.log(
          `Player ${playerId} cleared their vote in session ${sessionId} for task ${currentTask.name}.`
        );
        socket.emit("voteCleared", { message: "Your vote has been cleared." });
        broadcastSessionUpdate(io, sessionId);
      } else if (currentTask && currentTask.revealed) {
        socket.emit("voteError", {
          message: "Cannot clear vote after estimations are revealed.",
        });
      } else {
        socket.emit("voteError", {
          message:
            "Cannot clear vote at this time (no active task or task revealed).",
        });
      }
    } else {
      socket.emit("voteError", {
        message: "Error clearing vote: Session or player not found.",
      });
    }
  });

  // Event: Session creator request reveal of estimations
  socket.on("requestRevealEstimations", () => {
    const playerInfo = socketPlayerMap.get(socket.id);
    if (!playerInfo) {
      socket.emit("revealError", {
        message:
          "Error revealing estimations: You are not properly joined to a session.",
      });
      console.error(
        `requestRevealEstimations error: Socket ${socket.id} not found in socketPlayerMap.`
      );
      return;
    }

    const { playerId, sessionId } = playerInfo;
    console.log(
      `Player ${playerId} in session ${sessionId} requested to reveal estimations.`
    );

    const session = sessionManager.getSession(sessionId);
    if (!session) {
      socket.emit("revealError", { message: "Session not found." });
      console.error(
        `requestRevealEstimations error: Session ${sessionId} not found for player ${playerId}.`
      );
      return;
    }

    // Check if the requesting player is the creator of the session
    if (session.creatorId !== playerId) {
      socket.emit("revealError", {
        message: "Only the session creator can reveal estimations.",
      });
      console.warn(
        `Player ${playerId} (not creator ${session.creatorId}) attempted to reveal votes in session ${sessionId}.`
      );
      return;
    }

    const revealResult = sessionManager.revealEstimations(sessionId, playerId);

    if (revealResult) {
      console.log(
        `Estimations revealed for session ${sessionId}. Average: ${revealResult.average}`
      );
      broadcastSessionUpdate(io, sessionId);
    } else {
      socket.emit("revealError", {
        message:
          "Failed to reveal estimations. No active task or an error occurred.",
      });
      console.error(
        `Failed to reveal estimations for session ${sessionId} by player ${playerId}.`
      );
    }
  });

  socket.on("setCurrentTaskRequest", (data) => {
    const { taskId } = data;
    const playerInfo = socketPlayerMap.get(socket.id);

    if (!playerInfo) {
      socket.emit("taskError", {
        message: "Authentication error: Not joined to a session.",
      });
      return;
    }
    const { playerId, sessionId } = playerInfo;
    if (!taskId) {
      socket.emit("taskError", {
        message: "Task ID is required to set current task.",
      });
      return;
    }

    const session = sessionManager.getSession(sessionId);
    if (!session) {
      socket.emit("taskError", { message: "Session not found." });
      return;
    }
    if (session.creatorId !== playerId) {
      socket.emit("taskError", {
        message: "Only the session creator can change the task.",
      });
      return;
    }

    const updatedTask = sessionManager.setCurrentTask(sessionId, taskId);
    if (updatedTask) {
      console.log(
        `Task set to "${updatedTask.name}" in session ${sessionId} by creator ${playerId}`
      );
      broadcastSessionUpdate(io, sessionId);
    } else {
      socket.emit("taskError", {
        message: `Failed to set task. Task ID "${taskId}" might be invalid.`,
      });
    }
  });

  // Event: Session creator requests to move to the next task in the list
  socket.on("nextTaskRequest", () => {
    const playerInfo = socketPlayerMap.get(socket.id);
    if (!playerInfo) {
      socket.emit("taskError", { message: "Authentication error." });
      return;
    }
    const { playerId, sessionId } = playerInfo;

    const session = sessionManager.getSession(sessionId);
    if (!session) {
      socket.emit("taskError", { message: "Session not found." });
      return;
    }
    if (session.creatorId !== playerId) {
      socket.emit("taskError", {
        message: "Only the session creator can advance to the next task.",
      });
      return;
    }

    const currentTaskIndex = session.currentTaskIndex;
    if (session.tasks.length === 0) {
      socket.emit("taskError", { message: "No tasks in this session." });
      return;
    }
    if (currentTaskIndex >= session.tasks.length - 1) {
      socket.emit("taskError", {
        message: "Already at the last task or no tasks available.",
      });
      return;
    }

    const nextTask = session.tasks[currentTaskIndex + 1];
    if (nextTask) {
      sessionManager.setCurrentTask(sessionId, nextTask.id);
      console.log(
        `Moved to next task "${nextTask.name}" in session ${sessionId} by creator ${playerId}`
      );
      broadcastSessionUpdate(io, sessionId);
    } else {
      socket.emit("taskError", {
        message: "Could not move to the next task.",
      });
    }
  });

  // Event: Session creator requests to reset votes for the active task
  socket.on("resetCurrentTaskVotesRequest", () => {
    const playerInfo = socketPlayerMap.get(socket.id);
    if (!playerInfo) {
      socket.emit("taskError", { message: "Player info fetch error." });
      return;
    }
    const { playerId, sessionId } = playerInfo;

    const session = sessionManager.getSession(sessionId);
    if (!session) {
      socket.emit("taskError", { message: "Session not found." });
      return;
    }
    if (session.creatorId !== playerId) {
      socket.emit("taskError", {
        message: "Only the session creator can reset votes for the task.",
      });
      return;
    }

    if (sessionManager.resetVotesForCurrentTask(sessionId)) {
      console.log(
        `Votes for current task reset in session ${sessionId} by creator ${playerId}`
      );
      broadcastSessionUpdate(io, sessionId);
    } else {
      socket.emit("taskError", {
        message: "Failed to reset votes. No active task?",
      });
    }
  });

  // Event: Session creator adds a new task to the session
  socket.on("addNewTaskRequest", (data) => {
    const { taskName, taskDescription } = data;
    const playerInfo = socketPlayerMap.get(socket.id);

    if (!playerInfo) {
      socket.emit("taskError", { message: "Authentication error." });
      return;
    }
    const { playerId, sessionId } = playerInfo;
    if (!taskName) {
      socket.emit("taskError", {
        message: "Task name is required to add a new task.",
      });
      return;
    }

    const session = sessionManager.getSession(sessionId);
    if (!session) {
      socket.emit("taskError", { message: "Session not found." });
      return;
    }
    if (session.creatorId !== playerId) {
      socket.emit("taskError", {
        message: "Only the session creator can add tasks.",
      });
      return;
    }

    const newTask = sessionManager.addTaskToSession(
      sessionId,
      taskName,
      taskDescription
    );
    if (newTask) {
      console.log(
        `New task "${taskName}" added to session ${sessionId} by creator ${playerId}`
      );
      broadcastSessionUpdate(io, sessionId);
      socket.emit("taskAdded", {
        message: `Task "${taskName}" added successfully.`,
        taskId: newTask.id,
      });
    } else {
      socket.emit("taskError", { message: "Failed to add new task." });
    }
  });

  // Event: Player disconnects
  socket.on("disconnect", (reason) => {
    console.log(`Client disconnected: ${socket.id}. Reason: ${reason}`);
    const playerInfo = socketPlayerMap.get(socket.id);

    if (playerInfo) {
      const { playerId, sessionId, username } = playerInfo;
      console.log(
        `Player ${username} (ID: ${playerId}) from session ${sessionId} disconnected.`
      );

      // Remove player from the session model
      const removed = sessionManager.removePlayerFromSession(
        sessionId,
        playerId
      );
      if (removed) {
        console.log(
          `Player ${username} (ID: ${playerId}) successfully removed from session model ${sessionId}.`
        );
        // Broadcast updated session state to everyone
        broadcastSessionUpdate(io, sessionId);
      } else {
        console.warn(
          `Could not remove player ${playerId} from session model ${sessionId} on disconnect (already removed or error).`
        );
      }
      socketPlayerMap.delete(socket.id); // Delete the socket mapping
    } else {
      console.log(
        `Socket ${socket.id} disconnected but was not mapped to a player/session.`
      );
    }
  });

  // Placeholder for other game-specific events (will be added in next steps)
  // socket.on('playerVote', (data) => { /* ... */ });
  // socket.on('revealVotesRequest', (data) => { /* ... */ });
  // socket.on('resetVotesRequest', (data) => { /* ... */ });
  // socket.on('changeTaskRequest', (data) => { /* ... */ });

  // Error handling
  socket.on("error", (error) => {
    console.error(`Socket Error on ${socket.id}:`, error);
  });
}

module.exports = initializeWebSocket;
