// Mock axios before importing the module
const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPatch = jest.fn();
const mockDelete = jest.fn();

jest.mock('axios', () => {
  return {
    __esModule: true,
    default: {
      create: jest.fn(() => ({
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
        get: mockGet,
        post: mockPost,
        patch: mockPatch,
        delete: mockDelete,
      })),
    },
  };
});

// Mock storage
jest.mock('../../utils/storage', () => ({
  safeGetItem: jest.fn(),
  safeRemoveItem: jest.fn(),
  safeSetItem: jest.fn(),
}));

import { restaurantManageApi } from '../api';

describe('restaurantManageApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrders', () => {
    it('should call GET /restaurant/orders', async () => {
      const mockResponse = { data: { data: [], next_cursor: null } };
      mockGet.mockResolvedValue(mockResponse);

      const result = await restaurantManageApi.getOrders();
      expect(result).toEqual(mockResponse);
    });

    it('should pass status filter', async () => {
      const mockResponse = { data: { data: [] } };
      mockGet.mockResolvedValue(mockResponse);

      await restaurantManageApi.getOrders({ status: 'pending' });
      expect(mockGet).toHaveBeenCalledWith('/restaurant/orders', {
        params: { status: 'pending' },
      });
    });

    it('should pass pagination params', async () => {
      const mockResponse = { data: { data: [] } };
      mockGet.mockResolvedValue(mockResponse);

      await restaurantManageApi.getOrders({ limit: 10, cursor: 'abc' });
      expect(mockGet).toHaveBeenCalledWith('/restaurant/orders', {
        params: { limit: 10, cursor: 'abc' },
      });
    });
  });

  describe('getOrderById', () => {
    it('should call GET /restaurant/orders/:id', async () => {
      const mockResponse = { data: { id: 'ord-001', status: 'pending' } };
      mockGet.mockResolvedValue(mockResponse);

      const result = await restaurantManageApi.getOrderById('ord-001');
      expect(result).toEqual(mockResponse);
      expect(mockGet).toHaveBeenCalledWith('/restaurant/orders/ord-001');
    });
  });

  describe('updateOrderStatus', () => {
    it('should call PATCH /restaurant/orders/:id/status', async () => {
      const mockResponse = { data: { success: true } };
      mockPatch.mockResolvedValue(mockResponse);

      const result = await restaurantManageApi.updateOrderStatus('ord-001', 'confirmed');
      expect(result).toEqual(mockResponse);
      expect(mockPatch).toHaveBeenCalledWith('/restaurant/orders/ord-001/status', {
        status: 'confirmed',
      });
    });
  });

  describe('getProducts', () => {
    it('should call GET /restaurant/products', async () => {
      const mockResponse = { data: { data: [], next_cursor: null } };
      mockGet.mockResolvedValue(mockResponse);

      const result = await restaurantManageApi.getProducts();
      expect(result).toEqual(mockResponse);
      expect(mockGet).toHaveBeenCalledWith('/restaurant/products', { params: undefined });
    });
  });

  describe('createProduct', () => {
    it('should call POST /restaurant/products', async () => {
      const productData = {
        name: 'Burger Clássico',
        description: 'Hambúrguer com queijo',
        price: 2500,
        category: 'Hambúrguer',
      };
      const mockResponse = { data: { id: 'prod-001', ...productData } };
      mockPost.mockResolvedValue(mockResponse);

      const result = await restaurantManageApi.createProduct(productData);
      expect(result).toEqual(mockResponse);
      expect(mockPost).toHaveBeenCalledWith('/restaurant/products', productData);
    });
  });

  describe('updateProduct', () => {
    it('should call PATCH /restaurant/products/:id', async () => {
      const updateData = { price: 3000, isAvailable: false };
      const mockResponse = { data: { id: 'prod-001', ...updateData } };
      mockPatch.mockResolvedValue(mockResponse);

      const result = await restaurantManageApi.updateProduct('prod-001', updateData);
      expect(result).toEqual(mockResponse);
      expect(mockPatch).toHaveBeenCalledWith('/restaurant/products/prod-001', updateData);
    });
  });

  describe('deleteProduct', () => {
    it('should call DELETE /restaurant/products/:id', async () => {
      const mockResponse = { data: { success: true } };
      mockDelete.mockResolvedValue(mockResponse);

      const result = await restaurantManageApi.deleteProduct('prod-001');
      expect(result).toEqual(mockResponse);
      expect(mockDelete).toHaveBeenCalledWith('/restaurant/products/prod-001');
    });
  });

  describe('getCategories', () => {
    it('should call GET /restaurant/categories', async () => {
      const mockResponse = { data: ['Hambúrguer', 'Pizza', 'Bebidas'] };
      mockGet.mockResolvedValue(mockResponse);

      const result = await restaurantManageApi.getCategories();
      expect(result).toEqual(mockResponse);
      expect(mockGet).toHaveBeenCalledWith('/restaurant/categories');
    });
  });

  describe('createCategory', () => {
    it('should call POST /restaurant/categories', async () => {
      const mockResponse = { data: { id: 'cat-001', name: 'Hambúrguer' } };
      mockPost.mockResolvedValue(mockResponse);

      const result = await restaurantManageApi.createCategory({ name: 'Hambúrguer' });
      expect(result).toEqual(mockResponse);
      expect(mockPost).toHaveBeenCalledWith('/restaurant/categories', { name: 'Hambúrguer' });
    });
  });

  describe('deleteCategory', () => {
    it('should call DELETE /restaurant/categories/:id', async () => {
      const mockResponse = { data: { success: true } };
      mockDelete.mockResolvedValue(mockResponse);

      const result = await restaurantManageApi.deleteCategory('cat-001');
      expect(result).toEqual(mockResponse);
      expect(mockDelete).toHaveBeenCalledWith('/restaurant/categories/cat-001');
    });
  });

  describe('getStats', () => {
    it('should call GET /restaurant/stats', async () => {
      const mockResponse = {
        data: {
          todayOrders: 12,
          todayRevenue: 45000,
          weekOrders: 78,
          weekRevenue: 312000,
          monthOrders: 312,
          monthRevenue: 1248000,
          averageRating: 4.7,
          totalRatings: 89,
        },
      };
      mockGet.mockResolvedValue(mockResponse);

      const result = await restaurantManageApi.getStats();
      expect(result).toEqual(mockResponse);
      expect(mockGet).toHaveBeenCalledWith('/restaurant/stats', { params: undefined });
    });

    it('should pass periodo param', async () => {
      const mockResponse = { data: {} };
      mockGet.mockResolvedValue(mockResponse);

      await restaurantManageApi.getStats({ periodo: 'semana' });
      expect(mockGet).toHaveBeenCalledWith('/restaurant/stats', {
        params: { periodo: 'semana' },
      });
    });
  });

  describe('updateProfile', () => {
    it('should call PATCH /restaurant/profile', async () => {
      const profileData = {
        name: 'Sabor da Praça',
        description: 'Comida angolana',
        phone: '+244 923 789 012',
        deliveryFee: 500,
        deliveryTime: '30-45 min',
      };
      const mockResponse = { data: { success: true } };
      mockPatch.mockResolvedValue(mockResponse);

      const result = await restaurantManageApi.updateProfile(profileData);
      expect(result).toEqual(mockResponse);
      expect(mockPatch).toHaveBeenCalledWith('/restaurant/profile', profileData);
    });
  });

  describe('updateOpeningHours', () => {
    it('should call PATCH /restaurant/opening-hours', async () => {
      const hours = [
        { diaSemana: 1, abre: '08:00', fecha: '22:00' },
        { diaSemana: 2, abre: '08:00', fecha: '22:00' },
      ];
      const mockResponse = { data: { success: true } };
      mockPatch.mockResolvedValue(mockResponse);

      const result = await restaurantManageApi.updateOpeningHours(hours);
      expect(result).toEqual(mockResponse);
      expect(mockPatch).toHaveBeenCalledWith('/restaurant/opening-hours', { hours });
    });
  });

  describe('toggleOpen', () => {
    it('should call PATCH /restaurant/toggle-open with true', async () => {
      const mockResponse = { data: { success: true } };
      mockPatch.mockResolvedValue(mockResponse);

      const result = await restaurantManageApi.toggleOpen(true);
      expect(result).toEqual(mockResponse);
      expect(mockPatch).toHaveBeenCalledWith('/restaurant/toggle-open', { isOpen: true });
    });

    it('should call PATCH /restaurant/toggle-open with false', async () => {
      const mockResponse = { data: { success: true } };
      mockPatch.mockResolvedValue(mockResponse);

      const result = await restaurantManageApi.toggleOpen(false);
      expect(result).toEqual(mockResponse);
      expect(mockPatch).toHaveBeenCalledWith('/restaurant/toggle-open', { isOpen: false });
    });
  });
});
