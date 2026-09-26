const preset = require('jest-expo/jest-preset');

module.exports = {
  preset: 'jest-expo',
  // Preservar os setupFiles do preset e acrescentar o mock global de storage.
  setupFiles: [...preset.setupFiles, '<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|react-native-paper|react-native-reanimated|react-native-gesture-handler|react-native-maps|react-native-safe-area-context|react-native-screens|react-native-web|@reduxjs/toolkit|react-redux|axios|immer)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/**/*.{ts,tsx,js}',
    '**/*.{test,spec}.{ts,tsx,js}',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/components/__tests__/StyledText-test.js',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/theme/**',
  ],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
};
