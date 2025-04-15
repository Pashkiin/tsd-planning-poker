const { addPlayer, getPlayers, removePlayer } = require("../gameLogic/gameLogic");

const loginPlayer = (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Brak nazwy użytkownika" });

    const player = addPlayer(username);
    res.json({ userId: player.id });
};

const fetchPlayers = (_req, res) => {
    res.json({ players: getPlayers() });
};

const removePlayerFromSession = (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        return res.status(400).json({ error: "Brak userId" });
    }

    const success = removePlayer(userId);
    if (!success) {
        return res.status(404).json({ error: "Gracz nie znaleziony" });
    }

    res.status(200).json({ success: true });
};


module.exports = {
    loginPlayer,
    fetchPlayers,
    removePlayerFromSession,
};
