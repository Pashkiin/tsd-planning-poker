const { addPlayer, getPlayers, } = require("../gameLogic/gameLogic");

const loginPlayer = (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Brak nazwy użytkownika" });

    const player = addPlayer(username);
    res.json({ userId: player.id });
};

const fetchPlayers = (_req, res) => {
    res.json({ players: getPlayers() });
};



module.exports = {
    loginPlayer,
    fetchPlayers,
};
