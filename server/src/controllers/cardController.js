const Card = require('../models/cardModel'); // Ścieżka do modelu

// Pobranie wszystkich kart
exports.getAllCards = async (req, res) => {
    try {
        const cards = await Card.find(); // Pobieranie wszystkich kart
        res.status(200).json(cards); // Zwrócenie kart w formacie JSON
    } catch (error) {
        res.status(500).json({ message: "Błąd podczas pobierania kart.", error });
    }
};

// Pobranie karty po id
exports.getCardById = async (req, res) => {
    const { id } = req.params;
    try {
        const card = await Card.findById(id);
        if (!card) {
            return res.status(404).json({ message: "Karta nie znaleziona." });
        }
        res.status(200).json(card);
    } catch (error) {
        res.status(500).json({ message: "Błąd podczas pobierania karty.", error });
    }
};

// Dodanie nowej karty
exports.createCard = async (req, res) => {
    const { value, label, description, isSpecial, color } = req.body;
    try {
        const newCard = new Card({ value, label, description, isSpecial, color });
        await newCard.save();
        res.status(201).json(newCard);
    } catch (error) {
        res.status(500).json({ message: "Błąd podczas dodawania karty.", error });
    }
};

// Edytowanie karty
exports.updateCard = async (req, res) => {
    const { id } = req.params;
    const { value, label, description, isSpecial, color } = req.body;

    try {
        const updatedCard = await Card.findByIdAndUpdate(id, { value, label, description, isSpecial, color }, { new: true });
        if (!updatedCard) {
            return res.status(404).json({ message: "Karta do edytowania nie istnieje." });
        }
        res.status(200).json(updatedCard);
    } catch (error) {
        res.status(500).json({ message: "Błąd podczas edytowania karty.", error });
    }
};

// Usuwanie karty
exports.deleteCard = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedCard = await Card.findByIdAndDelete(id);
        if (!deletedCard) {
            return res.status(404).json({ message: "Karta do usunięcia nie istnieje." });
        }
        res.status(200).json({ message: "Karta została usunięta." });
    } catch (error) {
        res.status(500).json({ message: "Błąd podczas usuwania karty.", error });
    }
};
