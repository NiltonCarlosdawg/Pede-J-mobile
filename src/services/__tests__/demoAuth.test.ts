import {
  DemoRole,
  DemoSession,
  DEMO_LOGIN,
  DEMO_CLIENT_USER,
  DEMO_DELIVERY_USER,
  DEMO_RESTAURANT_USER,
  DEMO_RESTAURANT_LOGIN,
  isDemoCredentials,
  createDemoSession,
  loadDemoSession,
  saveDemoSession,
  clearDemoSession,
} from '../demoAuth';

// Mock the storage module
jest.mock('../../utils/storage', () => ({
  safeGetItem: jest.fn(),
  safeSetItem: jest.fn(),
  safeRemoveItem: jest.fn(),
}));

import { safeGetItem, safeSetItem, safeRemoveItem } from '../../utils/storage';

const mockSafeGetItem = safeGetItem as jest.MockedFunction<typeof safeGetItem>;
const mockSafeSetItem = safeSetItem as jest.MockedFunction<typeof safeSetItem>;
const mockSafeRemoveItem = safeRemoveItem as jest.MockedFunction<typeof safeRemoveItem>;

describe('demoAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear the in-memory session cache between tests
    clearDemoSession();
  });

  describe('constants', () => {
    it('should have client login credentials', () => {
      expect(DEMO_LOGIN.client.email).toBe('demo@pedeja.com');
      expect(DEMO_LOGIN.client.password).toBe('123456');
    });

    it('should have delivery login credentials', () => {
      expect(DEMO_LOGIN.delivery.email).toBe('entregador@pedeja.com');
      expect(DEMO_LOGIN.delivery.password).toBe('123456');
    });

    it('should have restaurant login credentials', () => {
      expect(DEMO_RESTAURANT_LOGIN.email).toBe('restaurante@pedeja.com');
      expect(DEMO_RESTAURANT_LOGIN.password).toBe('123456');
    });

    it('should have client user with role cliente', () => {
      expect(DEMO_CLIENT_USER.role).toBe('cliente');
      expect(DEMO_CLIENT_USER.id).toBe('demo-client');
    });

    it('should have delivery user with role entregador', () => {
      expect(DEMO_DELIVERY_USER.role).toBe('entregador');
      expect(DEMO_DELIVERY_USER.id).toBe('demo-delivery');
    });

    it('should have restaurant user with role restaurante', () => {
      expect(DEMO_RESTAURANT_USER.role).toBe('restaurante');
      expect(DEMO_RESTAURANT_USER.id).toBe('demo-restaurant');
      expect(DEMO_RESTAURANT_USER.name).toBe('Sabor da Praça');
    });
  });

  describe('isDemoCredentials', () => {
    it('should return true for valid client credentials', () => {
      expect(isDemoCredentials('demo@pedeja.com', '123456', 'client')).toBe(true);
    });

    it('should return true for valid delivery credentials', () => {
      expect(isDemoCredentials('entregador@pedeja.com', '123456', 'delivery')).toBe(true);
    });

    it('should return true for valid restaurant credentials', () => {
      expect(isDemoCredentials('restaurante@pedeja.com', '123456', 'restaurant')).toBe(true);
    });

    it('should return false for wrong password', () => {
      expect(isDemoCredentials('demo@pedeja.com', 'wrong', 'client')).toBe(false);
    });

    it('should return false for wrong email', () => {
      expect(isDemoCredentials('wrong@pedeja.com', '123456', 'client')).toBe(false);
    });

    it('should be case insensitive for email', () => {
      expect(isDemoCredentials('DEMO@PEDEJA.COM', '123456', 'client')).toBe(true);
    });

    it('should handle email with spaces', () => {
      expect(isDemoCredentials('  demo@pedeja.com  ', '123456', 'client')).toBe(true);
    });
  });

  describe('createDemoSession', () => {
    it('should create a client session', () => {
      const session = createDemoSession('client');
      expect(session.role).toBe('client');
      expect(session.user).toEqual(DEMO_CLIENT_USER);
      expect(session.token).toBe('demo-client-token');
    });

    it('should create a delivery session', () => {
      const session = createDemoSession('delivery');
      expect(session.role).toBe('delivery');
      expect(session.user).toEqual(DEMO_DELIVERY_USER);
      expect(session.token).toBe('demo-delivery-token');
    });

    it('should create a restaurant session', () => {
      const session = createDemoSession('restaurant');
      expect(session.role).toBe('restaurant');
      expect(session.user).toEqual(DEMO_RESTAURANT_USER);
      expect(session.token).toBe('demo-restaurant-token');
    });
  });

  describe('loadDemoSession', () => {
    it('should return null if no session in storage', async () => {
      mockSafeGetItem.mockResolvedValue(null);
      const session = await loadDemoSession();
      expect(session).toBeNull();
    });

    it('should load session from storage', async () => {
      const mockSession: DemoSession = {
        token: 'test-token',
        user: DEMO_RESTAURANT_USER,
        role: 'restaurant',
      };

      mockSafeGetItem.mockImplementation(async (key: string) => {
        if (key === 'authToken') return 'test-token';
        if (key === 'user') return JSON.stringify(DEMO_RESTAURANT_USER);
        if (key === 'sessionRole') return 'restaurant';
        return null;
      });

      const session = await loadDemoSession();
      expect(session).not.toBeNull();
      expect(session?.role).toBe('restaurant');
      expect(session?.user.name).toBe('Sabor da Praça');
    });

    it('should return null for invalid role', async () => {
      mockSafeGetItem.mockImplementation(async (key: string) => {
        if (key === 'authToken') return 'test-token';
        if (key === 'user') return JSON.stringify(DEMO_CLIENT_USER);
        if (key === 'sessionRole') return 'invalid-role';
        return null;
      });

      const session = await loadDemoSession();
      expect(session).toBeNull();
    });

    it('should handle storage errors gracefully', async () => {
      mockSafeGetItem.mockRejectedValue(new Error('Storage error'));
      const session = await loadDemoSession();
      expect(session).toBeNull();
    });
  });

  describe('saveDemoSession', () => {
    it('should save session to storage', async () => {
      mockSafeSetItem.mockResolvedValue(undefined);

      const session: DemoSession = {
        token: 'test-token',
        user: DEMO_RESTAURANT_USER,
        role: 'restaurant',
      };

      await saveDemoSession(session);

      expect(mockSafeSetItem).toHaveBeenCalledTimes(3);
      expect(mockSafeSetItem).toHaveBeenCalledWith('authToken', 'test-token');
      expect(mockSafeSetItem).toHaveBeenCalledWith('user', JSON.stringify(DEMO_RESTAURANT_USER));
      expect(mockSafeSetItem).toHaveBeenCalledWith('sessionRole', 'restaurant');
    });

    it('should handle storage errors gracefully', async () => {
      mockSafeSetItem.mockRejectedValue(new Error('Storage error'));

      const session: DemoSession = {
        token: 'test-token',
        user: DEMO_CLIENT_USER,
        role: 'client',
      };

      // Should not throw
      await expect(saveDemoSession(session)).resolves.not.toThrow();
    });
  });

  describe('clearDemoSession', () => {
    it('should clear session from storage', async () => {
      mockSafeRemoveItem.mockResolvedValue(undefined);

      await clearDemoSession();

      expect(mockSafeRemoveItem).toHaveBeenCalledTimes(3);
      expect(mockSafeRemoveItem).toHaveBeenCalledWith('authToken');
      expect(mockSafeRemoveItem).toHaveBeenCalledWith('user');
      expect(mockSafeRemoveItem).toHaveBeenCalledWith('sessionRole');
    });

    it('should handle storage errors gracefully', async () => {
      mockSafeRemoveItem.mockRejectedValue(new Error('Storage error'));

      await expect(clearDemoSession()).resolves.not.toThrow();
    });
  });
});
