const { PlayerModel } = require("./playerModel");
const { TaskModel } = require("./taskModel");
const { v4: uuidv4 } = require("uuid");

class SessionModel {
  constructor(
    creatorId,
    sessionName = "New Planning Poker Session",
    initialTasksData = []
  ) {
    if (!creatorId) {
      throw new Error("Creator ID is required to create a session.");
    }
    this.sessionId = uuidv4();
    this.sessionName = sessionName;
    this.creatorId = creatorId;
    this.players = [];
    this.tasks = [];
    this.currentTaskIndex = -1;

    // Initialize tasks
    if (initialTasksData && initialTasksData.length > 0) {
      initialTasksData.forEach((taskData, index) => {
        this.addTask(
          taskData.name,
          taskData.description,
          `${this.sessionId}-task-${index + 1}`
        );
      });
      if (this.tasks.length > 0) {
        this.setCurrentTask(this.tasks[0].id); // Set the first task as current by default
      }
    }
  }

  addPlayer(userId, username, socketId) {
    // Prevent duplicate usernames within the same session, or handle rejoining
    const existingPlayer = this.players.find(
      (p) => p.username.toLowerCase() === username.toLowerCase()
    );
    if (existingPlayer) {
      // Player is rejoining, update their socketId
      existingPlayer.updateSocketId(socketId);
      console.log(
        `Player ${username} reconnected to session ${this.sessionId} with new socket ${socketId}`
      );
      return existingPlayer;
    }

    const player = new PlayerModel(userId ,username, socketId);
    this.players.push(player);
    console.log(
      `Player ${username} (ID: ${player.id}, Socket: ${socketId}) added to session ${this.sessionId}`
    );
    return player;
  }

  removePlayer(playerId) {
    const index = this.players.findIndex((p) => p.id === playerId);
    if (index !== -1) {
      const removedPlayer = this.players.splice(index, 1)[0];
      console.log(
        `Player ${removedPlayer.username} (ID: ${playerId}) removed from session ${this.sessionId}`
      );
      // TODO: Think if we need to clear their estimations from tasks after leaving
      // this.tasks.forEach((task) => {
      //   if (task.estimations[playerId] !== undefined) {
      //     delete task.estimations[playerId];
      //   }
      // });
      return true;
    }
    console.warn(
      `Attempted to remove non-existent player ${playerId} from session ${this.sessionId}`
    );
    return false;
  }

  getPlayer(playerId) {
    return this.players.find((p) => p.id === playerId);
  }

  getPlayers() {
    return this.players;
  }

  addTask(taskName, taskDescription = "", taskId = null) {
    const newTaskId =
      taskId || `${this.sessionId}-task-${this.tasks.length + 1 + Date.now()}`;
    const task = new TaskModel(newTaskId, taskName, taskDescription);
    this.tasks.push(task);
    console.log(`Task "${taskName}" added to session ${this.sessionId}`);
    if (this.currentTaskIndex === -1 && this.tasks.length === 1) {
      this.setCurrentTask(newTaskId); // Auto-set first task as current
    }
    return task;
  }

  setCurrentTask(taskId) {
    const taskIndex = this.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex !== -1) {
      // Reset votes for players for the new task TODO: see how it will behave in the UI
      this.players.forEach((player) => player.resetVote());

      // If previous task was not completed, set it to pending
      if (
        this.currentTaskIndex !== -1 &&
        this.tasks[this.currentTaskIndex].status === "active"
      ) {
        this.tasks[this.currentTaskIndex].status = "pending";
      }

      this.currentTaskIndex = taskIndex;
      this.tasks[this.currentTaskIndex].status = "active"; // Or 'voting'
      this.tasks[this.currentTaskIndex].clearEstimations();
      console.log(
        `Current task set to "${this.tasks[taskIndex].name}" in session ${this.sessionId}`
      );
      return this.tasks[taskIndex];
    }
    console.warn(
      `Task with ID ${taskId} not found in session ${this.sessionId}.`
    );
    return null;
  }

  getCurrentTask() {
    if (
      this.currentTaskIndex >= 0 &&
      this.currentTaskIndex < this.tasks.length
    ) {
      return this.tasks[this.currentTaskIndex];
    }
    return null;
  }

  recordVote(playerId, cardValue) {
    const player = this.getPlayer(playerId);
    const currentTask = this.getCurrentTask();
    if (player && currentTask && !player.hasLockedVote) {
      // Only allow voting if not locked
      player.selectCard(cardValue);
      currentTask.recordEstimation(playerId, cardValue);
      console.log(
        `Vote ${cardValue} recorded for player ${playerId} for task "${currentTask.name}" in session ${this.sessionId}`
      );
      return true;
    }
    if (!player)
      console.warn(
        `Player ${playerId} not found for voting in session ${this.sessionId}`
      );
    if (!currentTask)
      console.warn(`No current task to vote on in session ${this.sessionId}`);
    if (player && player.hasLockedVote)
      console.warn(
        `Player ${playerId} vote is locked in session ${this.sessionId}`
      );
    return false;
  }

  lockPlayerVote(playerId) {
    const player = this.getPlayer(playerId);
    const currentTask = this.getCurrentTask();
    if (player && currentTask && player.selectedCardValue !== null) {
      // Must have a selection to lock
      player.setVoteLock(true);
      console.log(
        `Player ${playerId}'s vote locked for task "${currentTask.name}" in session ${this.sessionId}`
      );
      return true;
    }
    if (!player)
      console.warn(
        `Player ${playerId} not found for locking vote in session ${this.sessionId}`
      );
    if (!currentTask)
      console.warn(
        `No current task to lock vote on in session ${this.sessionId}`
      );
    if (player && player.selectedCardValue === null)
      console.warn(
        `Player ${playerId} has no card selected to lock in session ${this.sessionId}`
      );
    return false;
  }

  getLockedEstimationsCount() {
    return this.players.filter((p) => p.hasLockedVote).length;
  }

  // Method for the creator to force reveal
  revealEstimationsForCurrentTask() {
    const currentTask = this.getCurrentTask();
    if (currentTask) {
      // all players who haven't voted but are in session get a null
      this.players.forEach((player) => {
        if (currentTask.estimations[player.id] === undefined) {
          currentTask.recordEstimation(player.id, null);
        }
      });
      const result = currentTask.calculateAndRevealEstimations();
      console.log(
        `Estimations revealed for task "${currentTask.name}" in session ${this.sessionId}: Avg ${result.average}`
      );
      return result;
    }
    console.warn(
      `No current task to reveal estimations for in session ${this.sessionId}`
    );
    return null;
  }

  // Reset votes for the current task
  resetVotesForCurrentTask() {
    const currentTask = this.getCurrentTask();
    if (currentTask) {
      this.players.forEach((player) => player.resetVote());
      currentTask.clearEstimations();
      currentTask.status = "active";
      console.log(
        `Votes reset for task "${currentTask.name}" in session ${this.sessionId}`
      );
      return true;
    }
    return false;
  }

  // Get a summary state for clients
  getSessionState() {
    const currentTask = this.getCurrentTask();
    return {
      sessionId: this.sessionId,
      sessionName: this.sessionName,
      creatorId: this.creatorId,
      players: this.players.map((p) => ({
        id: p.id,
        username: p.username,
        // Only reveal selectedCardValue if votes are revealed for the current task OR if it's the current user's own card
        selectedCardValue:
          currentTask && currentTask.revealed
            ? p.selectedCardValue
            : p.hasLockedVote
            ? "Voted"
            : null,
        hasLockedVote: p.hasLockedVote,
      })),
      tasks: this.tasks.map((t) => ({
        id: t.id,
        name: t.name,
        status: t.status,
        averageEstimation: t.averageEstimation,
        revealed: t.revealed,
      })), // Send task summaries
      currentTaskId: currentTask ? currentTask.id : null,
      currentTaskName: currentTask ? currentTask.name : "No active task",
      currentTaskStatus: currentTask ? currentTask.status : null,
      lockedVotesCount: this.getLockedEstimationsCount(),
      totalPlayers: this.players.length,
      areVotesRevealedForCurrentTask: currentTask
        ? currentTask.revealed
        : false,
      currentTaskEstimations:
        currentTask && currentTask.revealed ? currentTask.estimations : {},
    };
  }
}

module.exports = { SessionModel };
