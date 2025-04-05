const http = require("http");
const app = require("./app");
const config = require("./config");
// const connectDB = require('./config/database'); // We'll create this later
// const setupSockets = require('./sockets'); // We'll create this later

const server = http.createServer(app);
const PORT = config.port;

// TODO: Connect to MongoDB
// connectDB();

// TODO: Setup Socket.IO
// setupSockets(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `MongoDB URI configured: ${config.mongodbUri ? "Yes" : "No! Check .env"}`
  );
});
