const http = require("http");
const app = require("./app");
const config = require("./src/config/settings");
const connectDB = require("./src/config/database");
const { Server } = require("socket.io");
const initializeWebSocket = require("./src/websockets/socketHandler");

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // TODO: restrict origins, example "http://localhost:4200"
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);
  initializeWebSocket(io, socket);
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
