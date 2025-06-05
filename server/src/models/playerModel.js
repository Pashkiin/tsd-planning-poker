class PlayerModel {
  constructor(username, socketId = null) {
    if (!username) {
      throw new Error("Username is required for a player.");
    }
    this.id = Math.random().toString(36).substring(2, 9);
    this.username = username;
    this.socketId = socketId;

    // selectedCard will store the vote for the current task
    this.selectedCardValue = null;
    this.hasLockedVote = false;
  }

  selectCard(card) {
    this.selectedCardValue = card;
  }

  setVoteLock(locked) {
    this.hasLockedVote = locked;
  }

  resetVote() {
    this.selectedCardValue = null;
    this.hasLockedVote = false;
  }

  updateSocketId(socketId) {
    this.socketId = socketId;
  }
}

module.exports = { PlayerModel };
