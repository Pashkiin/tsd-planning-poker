class PlayerModel {
  constructor(userId, username, socketId = null) {
    if (!username || !userId) {
      throw new Error("Username is required for a player.");
    }
    this.id = userId;
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
