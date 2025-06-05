const express = require("express");
const { getAllUsers } = require("../controllers/userController");

const router = express.Router();

router.get("/", getAllUsers); // GET /api/users

module.exports = router;
