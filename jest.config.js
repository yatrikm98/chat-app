module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/api"],
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  transform: {}, // No transform needed if using plain JS with ESM
};
