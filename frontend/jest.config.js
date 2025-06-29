export default {
  testEnvironment: "jest-fixed-jsdom",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  moduleNameMapper: {
    "\\.(css|less|sass|scss)$": "identity-obj-proxy",
    "^.+\\.svg$": "jest-transformer-svg",
  },

  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};