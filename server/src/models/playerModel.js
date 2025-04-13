class PlayerModel {
    constructor(username) {
        this.id = Math.random().toString(36).substring(7);
        this.username = username;
        this.selectedCard = null;
    }

    selectCard(card) {
        this.selectedCard = card;
    }
}

module.exports = { PlayerModel };
