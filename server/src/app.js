const express = require("express");
const app = express();

// Basic Middleware (add more later: cors, body-parser, etc.)
app.use(express.json());

// Basic Route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

// TODO: Add API routes from src/api later
// TODO: Add error handling middleware later

module.exports = app;
