const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');

// Pobranie wszystkich kart
router.get('/', cardController.getAllCards);

// Pobranie jednej karty po ID
router.get('/:id', cardController.getCardById);

// Dodanie nowej karty
router.post('/', cardController.createCard);

// Edytowanie karty
router.put('/:id', cardController.updateCard);

// Usunięcie karty
router.delete('/:id', cardController.deleteCard);

module.exports = router;
