/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type {Config} from 'jest';

const config: Config = {
  // Clear mocks before each test
  clearMocks: true,

  // Collect coverage information
  collectCoverage: true,

  // Coverage directory
  coverageDirectory: "coverage",

  // Coverage reporters
  coverageReporters: [
    "json",
    "text",
    "lcov",
    "clover"
  ],

  // Coverage collection patterns
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.test.{ts,tsx}",
    "!src/**/*.spec.{ts,tsx}",
    "!src/types/**/*",
    "!src/**/index.ts"
  ],

  // Test environment
  testEnvironment: "node",

  // Test file patterns
  testMatch: [
    "<rootDir>/tests/**/*.test.{ts,tsx}",
    "<rootDir>/tests/**/*.spec.{ts,tsx}",
    "<rootDir>/src/**/*.test.{ts,tsx}",
    "<rootDir>/src/**/*.spec.{ts,tsx}"
  ],

  // Test file extensions
  moduleFileExtensions: [
    "js",
    "ts",
    "json"
  ],

  // Transform configuration for TypeScript
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },

  // Module name mapping for path resolution
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },

  // Setup files
  setupFilesAfterEnv: [
    "<rootDir>/tests/setup/test-setup.ts"
  ],

  // Test timeout
  testTimeout: 30000,

  // Verbose output
  verbose: true,

  // Root directory
  rootDir: ".",
};

export default config;
