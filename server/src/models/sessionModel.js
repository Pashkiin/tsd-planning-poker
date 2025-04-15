const { PlayerModel } = require("./playerModel");

class SessionModel {
    constructor(taskName) {
        this.taskName = taskName;
        this.players = [];
    }

    addPlayer(username) {
        const player = new PlayerModel(username);
        this.players.push(player);
        return player;
    }

    removePlayer(playerId) {
        const index = this.players.findIndex(p => p.id === playerId);
        if (index !== -1) {
            this.players.splice(index, 1);
            return true;
        }
        return false;
    }


    getPlayers() {
        return this.players;
    }

    getSession() {
        return { taskName: this.taskName, players: this.players };
    }

    setTaskName(name) {
        this.taskName = name;
    }

    resetVotes() {
        this.players.forEach((player) => {
            player.selectedCard = null;
        });
    }
}

module.exports = { SessionModel };
