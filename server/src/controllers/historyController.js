const EstimationHistory = require("../models/estimationHistoryModel");
const mongoose = require("mongoose");
// Exaple of data returned for user request
// [
//     {
//         "_id": "684211306fb973d02d0ac9c5",
//         "userId": "6840c8a46268fe30a71b9c52",
//         "sessionId": "sessionABC",
//         "storyTitle": "Zadanie 1: logowanie",
//         "selectedCardValue": "5",
//         "teammates": [
//             "alice",
//             "bob"
//         ],
//         "allVotes": [
//             {
//                 "username": "alice",
//                 "card": "5",
//                 "_id": "684211306fb973d02d0ac9c6"
//             },
//             {
//                 "username": "bob",
//                 "card": "3",
//                 "_id": "684211306fb973d02d0ac9c7"
//             },
//             {
//                 "username": "you",
//                 "card": "5",
//                 "_id": "684211306fb973d02d0ac9c8"
//             }
//         ],
//         "date": "2025-06-05T21:50:40.146Z",
//         "__v": 0
//     }
// ]


const getUserHistory = async (req, res) => {
    try {
        const userId = req.params.userId; // or use token auth in req.user.id

        const history = await EstimationHistory.find({ userId }).sort({ date: -1 });
        res.status(200).json(history);
    } catch (err) {
        console.error("❌ Error fetching history:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};


// Example of data has to be sent to save estimation history
// {
//     "userId": "6840c8a46268fe30a71b9c52",
//     "sessionId": "sessionABC",
//     "storyTitle": "Zadanie 1: logowanie",
//     "selectedCardValue": "5",
//     "teammates": ["alice", "bob"],
//     "allVotes": [
//     { "username": "alice", "card": "5" },
//     { "username": "bob", "card": "3" },
//     { "username": "you", "card": "5" }
// ]
// }
const saveEstimationHistory = async (req, res) => {
    try {
        const {
            userId,
            sessionId,
            storyTitle,
            selectedCardValue,
            teammates = [],
            allVotes = []
        } = req.body;

        // Walidacja wymaganych pól
        if (!userId || !sessionId || !storyTitle || !selectedCardValue) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        const historyEntry = new EstimationHistory({
            userId: new mongoose.Types.ObjectId(userId),
            sessionId,
            storyTitle,
            selectedCardValue: String(selectedCardValue), // konwersja na string jeśli liczba
            teammates,
            allVotes
        });

        await historyEntry.save();
        res.status(201).json({ message: "Estimation history saved.", entry: historyEntry });
    } catch (err) {
        console.error("❌ Error saving estimation history:", err);
        res.status(500).json({ error: "Internal server error." });
    }
};

module.exports = {
    getUserHistory,
    saveEstimationHistory};
