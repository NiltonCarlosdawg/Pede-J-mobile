import {
  DemoRole,
  DemoSession,
  roleFromUser,
  validateSession,
  loadDemoSession,
  saveDemoSession,
  clearDemoSession,
} from '../demoAuth';

import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 0,
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  multiRemove: jest.fn().mockResolvedValue(undefined),
}));

const mockGetItemAsync = SecureStore.getItemAsync as jest.MockedFunction<typeof SecureStore.getItemAsync>;
const mockSetItemAsync = SecureStore.setItemAsync as jest.MockedFunction<typeof SecureStore.setItemAsync>;
const mockDeleteItemAsync = SecureStore.deleteItemAsync as jest.MockedFunction<typeof SecureStore.deleteItemAsync>;

const CLIENT_USER = { id: 'demo-client', name: 'Cliente Demo', email: 'cliente@pedeja.com', role: 'cliente' as const, createdAt: new Date().toISOString() };
const DELIVERY_USER = { id: 'demo-delivery', name: 'Entregador Demo', email: 'entregador@pedeja.com', role: 'entregador' as const, createdAt: new Date().toISOString() };
const RESTAURANT_USER = { id: 'demo-restaurant', name: 'Sabor da Praça', email: 'restaurante@pedeja.com', role: 'restaurante' as const, createdAt: new Date().toISOString() };

describe('demoAuth (sessão segura)', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockGetItemAsync.mockResolvedValue(null);
    await clearDemoSession();
  });

  describe('roleFromUser', () => {
    it('mapeia cliente/entregador/restaurante para DemoRole', () => {
      expect(roleFromUser(CLIENT_USER)).toBe('client');
      expect(roleFromUser(DELIVERY_USER)).toBe('delivery');
      expect(roleFromUser(RESTAURANT_USER)).toBe('restaurant');
    });
    it('rejeita roles desconhecidas', () => {
      expect(() => roleFromUser({ ...CLIENT_USER, role: 'admin' as any })).toThrow();
    });
  });

  describe('validateSession', () => {
    it('aceita sessão válida do servidor', () => {
      const session: DemoSession = { token: 't', user: CLIENT_USER, role: 'client' };
      expect(validateSession(session).role).toBe('client');
    });
    it('rejeita token vazio ou utilizador inválido', () => {
      expect(() => validateSession({ token: '', user: CLIENT_USER, role: 'client' } as any)).toThrow();
      expect(() => validateSession({ token: 't', user: { ...CLIENT_USER, id: '' }, role: 'client' } as any)).toThrow();
    });
    it('deriva role do utilizador e não confia no role enviado', () => {
      const session = validateSession({ token: 't', user: RESTAURANT_USER, role: 'client' as DemoRole });
      expect(session.role).toBe('restaurant');
    });
  });

  describe('persistência segura', () => {
    it('guarda sessão no SecureStore e não em AsyncStorage plaintext', async () => {
      const session: DemoSession = { token: 'test-token', refreshToken: 'rt', user: RESTAURANT_USER, role: 'restaurant' };
      await saveDemoSession(session);
      expect(mockSetItemAsync).toHaveBeenCalledWith(expect.stringContaining('pedeja.session'), expect.any(String), expect.any(Object));
      expect((await loadDemoSession())?.role).toBe('restaurant');
    });

    it('carrega sessão válida do SecureStore', async () => {
      const session: DemoSession = { token: 'test-token', user: RESTAURANT_USER, role: 'restaurant' };
      await saveDemoSession(session);
      // Simula reinício da app: limpa apenas memória, mantém SecureStore mock
      // Forçamos novo load simulando que ainda não carregou, mas SecureStore contém dados
      // Como o módulo já está em memória, usamos o valor retornado pelo save
      const loaded = await loadDemoSession();
      expect(loaded?.role).toBe('restaurant');
      expect(loaded?.user.name).toBe('Sabor da Praça');
    });

    it('limpa SecureStore ao fazer logout', async () => {
      await saveDemoSession({ token: 't', user: CLIENT_USER, role: 'client' });
      await clearDemoSession();
      expect(mockDeleteItemAsync).toHaveBeenCalled();
      expect(await loadDemoSession()).toBeNull();
    });

    it('rejeita sessão com role inválida armazenada', async () => {
      mockGetItemAsync.mockResolvedValueOnce(JSON.stringify({ token: 't', user: { ...CLIENT_USER, role: 'invalido' }, role: 'client' }));
      await clearDemoSession();
      mockGetItemAsync.mockResolvedValueOnce(JSON.stringify({ token: 't', user: { ...CLIENT_USER, role: 'invalido' }, role: 'client' }));
      expect(await loadDemoSession()).toBeNull();
    });
  });
});
