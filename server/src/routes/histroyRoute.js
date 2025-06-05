const express = require("express");
const { getUserHistory,saveEstimationHistory } = require("../controllers/historyController");

const router = express.Router();

router.get("/:userId", getUserHistory); // GET /api/history/:userId
router.post("/history", saveEstimationHistory); //POST /api/history

module.exports = router;
