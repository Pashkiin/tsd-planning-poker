const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    value: {
        type: Number,
        required: true
    },
    label: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    isSpecial: {
        type: Boolean,
        default: false
    },
    color: {
        type: String,
        default: '#FFFFFF'
    }
});

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;