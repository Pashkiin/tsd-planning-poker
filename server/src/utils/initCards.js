const Card = require("../models/cardModel");

const cards = [
  { value: 0, label: "0", description: "No work", isSpecial: false, color: "#E0E0E0" },
  { value: 1, label: "1", description: "Small task", isSpecial: false, color: "#A8E6CF" },
  { value: 2, label: "2", description: "Low effort", isSpecial: false, color: "#DCE775" },
  { value: 3, label: "3", description: "Medium effort", isSpecial: false, color: "#FFD54F" },
  { value: 5, label: "5", description: "Typical task", isSpecial: false, color: "#FFB74D" },
  { value: 8, label: "8", description: "Complex task", isSpecial: false, color: "#FF8A65" },
  { value: 13, label: "13", description: "High uncertainty", isSpecial: false, color: "#F06292" },
  { value: 20, label: "20", description: "High difficulty", isSpecial: false, color: "#BA68C8" },
  { value: 40, label: "40", description: "Huge task", isSpecial: false, color: "#7986CB" },
  { value: 100, label: "100", description: "Impossible to complete", isSpecial: false, color: "#4FC3F7" },
  { value: -1, label: "?", description: "No opinion", isSpecial: true, color: "#B0BEC5" },
  { value: 1000, label: "∞", description: "Too big", isSpecial: true, color: "#CFD8DC" }
];

// Function to initialize cards in the database
const initializeCards = async () => {
  try {
    // Check if cards already exist in the database
    const existingCards = await Card.find();

    if (existingCards.length === 0) {
      // If no cards in the database, insert all
      await Card.insertMany(cards);
      console.log("Cards have been initialized in the database.");
    } else {
      console.log("Cards already exist in the database.");
    }
  } catch (error) {
    console.error("Error initializing cards: ", error);
  }
};

module.exports = initializeCards;