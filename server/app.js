const express = require("express");
const applyJsonMiddleware = require("./src/middlewares/json.middleware");

const app = express();

//API middlewares
applyJsonMiddleware(app);

// Basic Route
app.get("/api", (req, res) => {
  res.status(200).json({ status: "UP" });
});

// TODO: Add API routes from src/api later
// TODO: Add error handling middleware later

module.exports = app;
