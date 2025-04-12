const http = require("http");
const app = require("./app");
const config = require("./src/config/settings");
const connectDB = require("./src/config/database");

const server = http.createServer(app);
const PORT = config.port;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Serwer działa na porcie ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Błąd połączenia z bazą danych. Serwer nie został uruchomiony.");
    console.error(err);
    process.exit(1);
  });
