const http = require("http");
const app = require("./app");
const config = require("./src/config/settings");
const connectDB = require("./src/config/database");
const { Server } = require("socket.io");

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // TODO: restrict origins, example "http://localhost:4200"
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  // Example: Listen for a custom event from the client, broadcast it to others, and send a response back
  socket.on("clientMessage", (data) => {
    console.log(`✉️ Message from ${socket.id}:`, data);

    socket.broadcast.emit("serverMessage", {
      user: socket.id,
      message: data.message,
    });

    socket.emit("serverMessage", {
      user: "Server",
      message: "Message received!",
    });
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
    // TODO: Handle disconnection logic
  });

  // More specific event handlers will be added in a dedicated file
  // initializeWebSocket(io, socket, sessionManager);
});

const PORT = config.port;

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`🚀 Serwer działa na porcie ${PORT}`);
      console.log(`🔗 WebSocket zainicjalowany`);
    });
  })
  .catch((err) => {
    console.error(
      "❌ Błąd połączenia z bazą danych. Serwer nie został uruchomiony."
    );
    console.error(err);
    process.exit(1);
  });

module.exports = { httpServer, io };
