/**
 * Setup global de testes.
 * O AsyncStorage não tem módulo nativo no ambiente Jest, então o mock
 * oficial em memória é registrado aqui para todos os arquivos de teste.
 * Arquivos de teste que declarem o seu próprio `jest.mock` continuam a
 * sobrepor este (o mock do ficheiro é registado depois).
 */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
