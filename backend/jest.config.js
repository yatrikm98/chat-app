module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>"], // this will point to /api
  testMatch: ["<rootDir>/test/**/*.test.js"], // match all .test.js files under /test
  transform: {}, // no transform needed for plain JS
};
