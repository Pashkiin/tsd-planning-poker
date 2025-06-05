const express = require("express");
const applyJsonMiddleware = require("./src/middlewares/json.middleware");

//routes
const cardRouter = require("./src/routes/cardRoute");
const playerRouter = require("./src/routes/playerRoute");
const gameRouter = require("./src/routes/gameRoute");
const sessionRouter = require("./src/routes/sessionRoute");
const taskimportRouter = require("./src/routes/taskRoute")
const app = express();

//API middlewares
applyJsonMiddleware(app);

// Basic Route
app.get("/api", (req, res) => {
  res.status(200).json({ status: "UP" });
});

app.use("/api/cards", cardRouter);
app.use("/api/player", playerRouter);
app.use("/api/game", gameRouter);
app.use("/api/sessions", sessionRouter);
app.use("/api/tasks", taskimportRouter)

module.exports = app;
