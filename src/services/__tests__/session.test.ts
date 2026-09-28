import {
  SessionRole,
  Session,
  roleFromUser,
  validateSession,
  loadSession,
  saveSession,
  clearStoredSession,
} from '../session';

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

const mockGetItemAsync = SecureStore.getItemAsync as jest.MockedFunction<
  typeof SecureStore.getItemAsync
>;
const mockSetItemAsync = SecureStore.setItemAsync as jest.MockedFunction<
  typeof SecureStore.setItemAsync
>;
const mockDeleteItemAsync = SecureStore.deleteItemAsync as jest.MockedFunction<
  typeof SecureStore.deleteItemAsync
>;

const CLIENT_USER = {
  id: 'test-client',
  name: 'Cliente Teste',
  email: 'cliente@pedeja.com',
  role: 'cliente' as const,
  createdAt: new Date().toISOString(),
};
const DELIVERY_USER = {
  id: 'test-delivery',
  name: 'Entregador Teste',
  email: 'entregador@pedeja.com',
  role: 'entregador' as const,
  createdAt: new Date().toISOString(),
};
const RESTAURANT_USER = {
  id: 'test-restaurant',
  name: 'Sabor da Praça',
  email: 'restaurante@pedeja.com',
  role: 'restaurante' as const,
  createdAt: new Date().toISOString(),
};

describe('session (sessão segura)', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockGetItemAsync.mockResolvedValue(null);
    await clearStoredSession();
  });

  describe('roleFromUser', () => {
    it('mapeia cliente e entregador para SessionRole', () => {
      expect(roleFromUser(CLIENT_USER)).toBe('client');
      expect(roleFromUser(DELIVERY_USER)).toBe('delivery');
    });
    it('rejeita o perfil de restaurante (frontend separado)', () => {
      expect(() => roleFromUser(RESTAURANT_USER)).toThrow('aplicação separada');
    });
    it('rejeita roles desconhecidas', () => {
      expect(() => roleFromUser({ ...CLIENT_USER, role: 'admin' as any })).toThrow();
    });
  });

  describe('validateSession', () => {
    it('aceita sessão válida do servidor', () => {
      const session: Session = { token: 't', user: CLIENT_USER, role: 'client' };
      expect(validateSession(session).role).toBe('client');
    });
    it('rejeita token vazio ou utilizador inválido', () => {
      expect(() =>
        validateSession({ token: '', user: CLIENT_USER, role: 'client' } as any),
      ).toThrow();
      expect(() =>
        validateSession({ token: 't', user: { ...CLIENT_USER, id: '' }, role: 'client' } as any),
      ).toThrow();
    });
    it('deriva role do utilizador e não confia no role enviado', () => {
      const session = validateSession({
        token: 't',
        user: DELIVERY_USER,
        role: 'client' as SessionRole,
      });
      expect(session.role).toBe('delivery');
    });
    it('rejeita sessão de conta restaurante', () => {
      expect(() =>
        validateSession({ token: 't', user: RESTAURANT_USER, role: 'client' as SessionRole }),
      ).toThrow('aplicação separada');
    });
  });

  describe('persistência segura', () => {
    it('guarda sessão no SecureStore e não em AsyncStorage plaintext', async () => {
      const session: Session = {
        token: 'test-token',
        refreshToken: 'rt',
        user: DELIVERY_USER,
        role: 'delivery',
      };
      await saveSession(session);
      expect(mockSetItemAsync).toHaveBeenCalledWith(
        expect.stringContaining('pedeja.session'),
        expect.any(String),
        expect.any(Object),
      );
      expect((await loadSession())?.role).toBe('delivery');
    });

    it('carrega sessão válida do SecureStore', async () => {
      const session: Session = {
        token: 'test-token',
        user: DELIVERY_USER,
        role: 'delivery',
      };
      await saveSession(session);
      const loaded = await loadSession();
      expect(loaded?.role).toBe('delivery');
      expect(loaded?.user.name).toBe('Entregador Teste');
    });

    it('limpa SecureStore ao fazer logout', async () => {
      await saveSession({ token: 't', user: CLIENT_USER, role: 'client' });
      await clearStoredSession();
      expect(mockDeleteItemAsync).toHaveBeenCalled();
      expect(await loadSession()).toBeNull();
    });

    it('rejeita sessão com role inválida armazenada', async () => {
      mockGetItemAsync.mockResolvedValueOnce(
        JSON.stringify({ token: 't', user: { ...CLIENT_USER, role: 'invalido' }, role: 'client' }),
      );
      await clearStoredSession();
      mockGetItemAsync.mockResolvedValueOnce(
        JSON.stringify({ token: 't', user: { ...CLIENT_USER, role: 'invalido' }, role: 'client' }),
      );
      expect(await loadSession()).toBeNull();
    });

    it('descarta sessão de conta restaurante guardada', async () => {
      mockGetItemAsync.mockResolvedValueOnce(
        JSON.stringify({ token: 't', user: RESTAURANT_USER, role: 'restaurant' }),
      );
      await clearStoredSession();
      mockGetItemAsync.mockResolvedValueOnce(
        JSON.stringify({ token: 't', user: RESTAURANT_USER, role: 'restaurant' }),
      );
      expect(await loadSession()).toBeNull();
      expect(mockDeleteItemAsync).toHaveBeenCalled();
    });
  });
});
