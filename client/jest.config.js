module.exports = {
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"], // Create this file
  globalSetup: "jest-preset-angular/global-setup",
  moduleNameMapper: {
    // Add path mappings if you use them in tsconfig.json
  },
};
