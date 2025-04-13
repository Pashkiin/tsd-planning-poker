const {selectCard, getSession,setTaskName, resetVotes } = require("../gameLogic/gameLogic");

const voteCard = (req, res) => {
    const { userId, cardValue } = req.body;

    if (!userId || !cardValue) {
        return res.status(400).json({ error: "Brak danych do głosowania" });
    }

    const success = selectCard(userId, cardValue);
    if (!success) {
        return res.status(404).json({ error: "Gracz nie znaleziony" });
    }

    res.json({ success: true });
};

const getGameSession = (_req, res) => {
    res.json(getSession());
};

const updateTask = (req, res) => {
    const { taskName } = req.body;
    if (!taskName) return res.status(400).json({ error: "Brak nazwy zadania" });

    setTaskName(taskName);
    resetVotes();

    res.json({ success: true });
};

module.exports = {
    voteCard,
    getGameSession,
    updateTask,
};