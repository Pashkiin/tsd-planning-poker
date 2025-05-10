const http = require("http");
const { Server } = require("socket.io");
const app = require("./app"); // Your Express app
const config = require("./src/config/settings");
const connectDB = require("./src/config/database");
const initializeWebSocket = require("./src/websockets/socketHandler");

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  initializeWebSocket(io, socket);
});

const configuredPort = config.port;

async function startServer(portToListenOn) {
  try {
    await connectDB();
    console.log("Database connected successfully for server start.");

    return new Promise((resolve, reject) => {
      if (httpServer.listening) {
        console.warn(
          `Server is already listening. Attempting to close before restarting on port ${portToListenOn}.`
        );
        httpServer.close((err) => {
          if (err) {
            console.error("Error closing previous server instance:", err);
          }
          httpServer
            .listen(portToListenOn, () => {
              console.log(
                `🚀 HTTP Server with WebSockets running on port ${portToListenOn}`
              );
              resolve(httpServer);
            })
            .on("error", (listenErr) => {
              console.error(
                `❌ Failed to start server on port ${portToListenOn} after attempting close:`,
                listenErr.message
              );
              reject(listenErr);
            });
        });
      } else {
        httpServer
          .listen(portToListenOn, () => {
            console.log(
              `🚀 HTTP Server with WebSockets running on port ${portToListenOn}`
            );
            resolve(httpServer);
          })
          .on("error", (err) => {
            console.error(
              `❌ Failed to start server on port ${portToListenOn}:`,
              err.message
            );
            if (err.code === "EADDRINUSE") {
              console.error(
                `Port ${portToListenOn} is already in use. Is another server instance running?`
              );
            }
            reject(err);
          });
      }
    });
  } catch (dbError) {
    console.error(
      "❌ Błąd połączenia z bazą danych. Serwer nie może zostać uruchomiony."
    );
    console.error(dbError);
    throw dbError;
  }
}

if (require.main === module) {
  startServer(configuredPort).catch((error) => {
    console.error("Failed to launch server:", error);
    process.exit(1);
  });
}

module.exports = { httpServer, io, startServer, configuredPort };
