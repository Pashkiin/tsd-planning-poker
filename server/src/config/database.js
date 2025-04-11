const mongoose = require('mongoose');
const config = require("./settings");

const connectDB = () => {
    return mongoose.connect(config.mongodbUri)
        .then(() => {
            console.log('✅ Połączono z bazą MongoDB');
        });
};

module.exports = connectDB;