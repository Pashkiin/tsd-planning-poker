const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController.js');

router.post('/login', (req, res) => {
    playerController.loginPlayer(req, res);
});

router.get('/players', (req, res) => {
    playerController.fetchPlayers(req, res);
});

router.delete('/delete/:userId', (req,res) =>{
    playerController.removePlayerFromSession(req,res)
})

module.exports = router;
