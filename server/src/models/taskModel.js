class TaskModel {
  constructor(id, name, description = "", subTasks = []) {
    if (!id || !name) {
      throw new Error("Task ID and Name are required.");
    }
    this.id = id;
    this.name = name;
    this.description = description;
    this.subTasks = subTasks;
    this.status = "pending"; // possible statuses: pending, active, voting, estimated, completed
    this.estimations = {}; // estimations as { playerId: cardValue }
    this.averageEstimation = null; // calculated when votes are revealed
    this.revealed = false; // whether votes for this task have been revealed
  }

  // Method to add a sub-task
  addSubTask(subTask) {
    if (subTask instanceof TaskModel) {
      this.subTasks.push(subTask);
    } else {
      console.error(
        "Invalid subTask provided. Must be an instance of TaskModel."
      );
    }
  }

  // Method to record an estimation for a player
  recordEstimation(playerId, cardValue) {
    // Allow voting if active or specifically in voting phase
    if (this.status !== "voting" && this.status !== "active") {
      console.warn(
        `Cannot record estimation for task "${this.name}" in status "${this.status}".`
      );
      return false;
    }
    this.estimations[playerId] = cardValue;
    return true;
  }

  // Method to clear estimations for this task
  clearEstimations() {
    this.estimations = {};
    this.averageEstimation = null;
    this.revealed = false;
  }

  // Method to calculate and reveal estimations
  calculateAndRevealEstimations() {
    const numericVotes = Object.values(this.estimations).filter(
      (vote) => typeof vote === "number" && vote >= 0
    ); // Filter out non-numeric votes

    if (numericVotes.length > 0) {
      const sum = numericVotes.reduce((acc, val) => acc + val, 0);
      this.averageEstimation = sum / numericVotes.length;
    } else {
      this.averageEstimation = null;
    }
    this.revealed = true;
    this.status = "estimated"; // Update status
    return { estimations: this.estimations, average: this.averageEstimation };
  }
}

module.exports = { TaskModel };
