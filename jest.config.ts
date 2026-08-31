import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/e2e/"],
  collectCoverageFrom: ["src/app/**/*.{ts,tsx}", "src/lib/**/*.{ts,tsx}", "!**/*.test.{ts,tsx}"],
  coverageReporters: ["json-summary", "html", "text-summary"],
};

export default createJestConfig(config);
