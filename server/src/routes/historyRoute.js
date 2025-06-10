const express = require("express");
const { getUserHistory, saveEstimationHistory, deleteEstimationHistory } = require("../controllers/historyController");

const router = express.Router();

router.get("/:userId", getUserHistory); // GET /api/history/:userId
router.post("/", saveEstimationHistory); //POST /api/history/add
router.delete("/:historyId", deleteEstimationHistory); // DELETE /api/history/:historyId

module.exports = router;
