module.exports = {
  testEnvironment: "node", // E2E tests run in Node controlling the browser
  verbose: true,
  testTimeout: 60000, // Increase timeout for browser tests
  // Define test match patterns for specs folder
  testMatch: [
    "**/specs/**/*.spec.js", // Or .ts if using TypeScript
  ],
  // Add setup/teardown files if needed
};
