const serverless = require("serverless-http");
const app = require("../app"); // your existing app.js

module.exports.handler = serverless(app);
