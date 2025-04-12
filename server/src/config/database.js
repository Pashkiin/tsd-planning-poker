// server/src/config/database.js

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const config = require("./settings");
const initializeCards = require("../utils/initCards");

let mongoServer;

const connectDB = async () => {
  let mongoUri;

  if (process.env.NODE_ENV === "test") {
    // --- Test Environment ---
    try {
      // Create and start the in-memory server
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log(`In-memory MongoDB started for testing at ${mongoUri}`);
    } catch (error) {
      console.error("❌ Błąd podczas uruchamiania MongoDB in-memory:", error);
      process.exit(1);
    }

    // Connect Mongoose to the in-memory database
    return mongoose
      .connect(mongoUri)
      .then(() => {
        console.log("✅ Połączono z bazą MongoDB (In-Memory) dla testów");
        // We usually DON'T run initializers like initializeCards() in tests,
        // as tests should control their own specific seed data via beforeEach/beforeAll.
      })
      .catch((err) => {
        console.error("❌ Błąd połączenia z bazą MongoDB (In-Memory):", err);
        process.exit(1);
      });
  } else {
    // --- Development/Production Environment ---
    mongoUri = config.mongodbUri;

    if (!mongoUri) {
      console.error(
        "❌ Błąd: Brak MONGODB_URI w konfiguracji dla środowiska non-test."
      );
      process.exit(1);
    }

    return mongoose
      .connect(mongoUri)
      .then(() => {
        console.log(
          `✅ Połączono z bazą MongoDB (${mongoUri.substring(0, 25)}...)`
        );
        initializeCards();
      })
      .catch((err) => {
        console.error(
          `❌ Błąd połączenia z bazą MongoDB (${mongoUri.substring(
            0,
            25
          )}...):`,
          err
        );
        process.exit(1);
      });
  }
};

// Export connectDB and potentially disconnectDB
module.exports = connectDB;
