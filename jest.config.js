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
  testMatch: ['**/__tests__/**/*.{ts,tsx,js}', '**/*.{test,spec}.{ts,tsx,js}'],
  testPathIgnorePatterns: ['/node_modules/', '/components/__tests__/StyledText-test.js'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/theme/**',
  ],
  coverageThreshold: {
    // O Jest aplica o threshold "global" apenas aos ficheiros NÃO abrangidos
    // pelas entradas específicas abaixo. Este piso protege o código ainda sem
    // testes (UI em `app/**`, serviços) contra regressões grandes; a exigência
    // real está nos limites por módulo, logo a seguir.
    global: {
      statements: 1,
      branches: 0.5,
      functions: 1,
      lines: 1,
    },
    // Módulos com testes: limite estrito, qualquer regressão falha o CI.
    './src/store/cartSlice.ts': {
      statements: 95,
      branches: 80,
      functions: 100,
      lines: 95,
    },
    './src/store/cartSelectors.ts': {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
    './src/store/paymentMethodsSlice.ts': {
      statements: 95,
      branches: 80,
      functions: 100,
      lines: 95,
    },
    './src/store/restaurantOrdersSlice.ts': {
      statements: 100,
      branches: 95,
      functions: 100,
      lines: 100,
    },
    './src/services/favorites.ts': {
      statements: 90,
      branches: 90,
      functions: 95,
      lines: 90,
    },
  },
};
