const express = require("express");
const applyJsonMiddleware = require("./src/middlewares/json.middleware");

//routes
const cardRouter = require("./src/routes/cardRoute"); // Ścieżka do routera

const app = express();

//API middlewares
applyJsonMiddleware(app);

// Basic Route
app.get("/api", (req, res) => {
  res.status(200).json({ status: "UP" });
});

app.use("/api/cards", cardRouter);

module.exports = app;
