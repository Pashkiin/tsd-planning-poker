const mongoose = require('mongoose');
const config = require("./settings");
const initializeCards = require("../utils/initCards");

const connectDB = () => {
    return mongoose.connect(config.mongodbUri)
        .then(() => {
            console.log('✅ Połączono z bazą MongoDB');
            initializeCards();
        });
};

module.exports = connectDB;