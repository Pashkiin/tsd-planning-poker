const { PlayerModel } = require("../models/playerModel");
const { SessionModel } = require("../models/sessionModel");

const session = new SessionModel("Pierwsze zadanie");

function addPlayer(username) {
    return session.addPlayer(username);
}

function getPlayers() {
    return session.getPlayers();
}

function selectCard(playerId, card) {
    const player = session.getPlayers().find((p) => p.id === playerId);
    if (!player) return false;
    player.selectCard(card);
    return true;
}

function removePlayer(playerId) {
    return session.removePlayer(playerId);
}

function getSession() {
    return session;
}

function setTaskName(name) {
    session.setTaskName(name);
}

function resetVotes() {
    session.resetVotes();
}

module.exports = {
    addPlayer,
    getPlayers,
    selectCard,
    removePlayer,
    getSession,
    setTaskName,
    resetVotes
};
