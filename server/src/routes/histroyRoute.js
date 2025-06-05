const express = require("express");
const { getUserHistory } = require("../controllers/historyController");

const router = express.Router();

router.get("/:userId", getUserHistory); // GET /api/history/:userId

module.exports = router;
