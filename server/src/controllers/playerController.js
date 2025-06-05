const gameLogic = require("../gameLogic/gameLogic");

const loginPlayer = (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Brak nazwy użytkownika" });
  }
  const tempPlayerProfileId = `user_${Math.random()
    .toString(36)
    .substring(2, 9)}`;
  console.log(
    `User '${username}' logged in, assigned temporary profile ID: ${tempPlayerProfileId}`
  );
  res.json({ userId: tempPlayerProfileId, username: username });
};

const fetchPlayersInSession = (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) {
    return res
      .status(400)
      .json({ error: "Session ID is required to fetch players." });
  }
  const players = gameLogic.getPlayers(sessionId);
  if (players) {
    res.json({
      players: players.map((p) => ({
        id: p.id,
        username: p.username,
        selectedCardValue: p.selectedCardValue,
        hasLockedVote: p.hasLockedVote,
      })),
    });
  } else {
    res
      .status(404)
      .json({ error: "Session not found or no players in session." });
  }
};

module.exports = {
  loginPlayer,
  fetchPlayersInSession,
};
