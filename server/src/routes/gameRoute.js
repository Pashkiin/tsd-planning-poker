const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

router.post('/vote', (req, res) => {
    gameController.voteCard(req, res);
});

router.get('/session', (req, res) => {
    gameController.getGameSession(req, res);
});

router.post('/task', (req, res) => {
    gameController.updateTask(req, res);
});
router.post('/reset', gameController.resetVotesHandler);

module.exports = router;