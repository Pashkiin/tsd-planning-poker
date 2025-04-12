const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let mongoServer;

module.exports.setup = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  console.log(`In-memory MongoDB started at ${mongoUri}`);
};

module.exports.teardown = async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  console.log("In-memory MongoDB stopped.");
};

module.exports.clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({}); // Delete all documents in all collections
  }
};
