// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const globals = require('globals');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['coverage/*', 'dist/*', '.expo/*', 'android/*', 'ios/*'],
  },
  {
    rules: {
      // Regras do projeto
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-duplicate-imports': 'error',
    },
  },
  {
    // Regras do React Compiler (react-hooks v7). Estão como "warn" porque o
    // código legado ainda as viola em ~16 sítios: sincronização de params de
    // rota em effects, Date.now() em render e keys de idempotência em refs.
    // Corrigir cada caso exige refactor comportamental, por isso mantêm-se
    // visíveis no output do lint sem bloquear o CI.
    // Promover para 'error' à medida que forem corrigidos.
    files: ['app/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'],
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/refs': 'warn',
    },
  },
  {
    // Testes podem usar console livremente
    files: ['**/__tests__/**/*.{ts,tsx,js}', '**/*.{test,spec}.{ts,tsx,js}'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    // Ficheiros de setup (jest.setup.js, etc.) correm em Node com o global `jest`
    files: ['**/*.setup.js', 'jest.setup.js'],
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
    },
  },
]);
