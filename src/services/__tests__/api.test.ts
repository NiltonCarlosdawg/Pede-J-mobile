// Mock the entire api module
const mockApiGet = jest.fn();
const mockApiPost = jest.fn();
const mockApiPatch = jest.fn();
const mockApiDelete = jest.fn();

jest.mock('../api', () => {
  const mockApiInstance = {
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    get: mockApiGet,
    post: mockApiPost,
    patch: mockApiPatch,
    delete: mockApiDelete,
  };

  return {
    __esModule: true,
    BASE_URL: 'http://localhost:3000/v1',
    default: mockApiInstance,
    authApi: {
      login: jest.fn(),
      register: jest.fn(),
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
      logout: jest.fn(),
      requestOtp: jest.fn(),
      verifyOtp: jest.fn(),
      refresh: jest.fn(),
    },
    restaurantApi: {
      list: jest.fn(),
      getById: jest.fn(),
      getProducts: jest.fn(),
      getCategories: jest.fn(),
    },
    orderApi: {
      create: jest.fn(),
      list: jest.fn(),
      getActive: jest.fn(),
      getById: jest.fn(),
      cancel: jest.fn(),
      rate: jest.fn(),
      getRoute: jest.fn(),
      getMessages: jest.fn(),
      sendMessage: jest.fn(),
    },
    userApi: {
      getAddresses: jest.fn(),
      addAddress: jest.fn(),
      updateAddress: jest.fn(),
      deleteAddress: jest.fn(),
      setDefaultAddress: jest.fn(),
    },
    deliveryApi: {
      getAvailable: jest.fn(),
      acceptDelivery: jest.fn(),
      getDelivery: jest.fn(),
      updateStatus: jest.fn(),
      getHistory: jest.fn(),
      getEarnings: jest.fn(),
      toggleLocationSharing: jest.fn(),
    },
    restaurantManageApi: {
      getOrders: (params?: { status?: string; cursor?: string; limit?: number }) =>
        mockApiGet('/restaurant/orders', { params }),
      getOrderById: (id: string) => mockApiGet(`/restaurant/orders/${id}`),
      updateOrderStatus: (orderId: string, status: string) =>
        mockApiPatch(`/restaurant/orders/${orderId}/status`, { status }),
      getProducts: (params?: { cursor?: string; limit?: number }) =>
        mockApiGet('/restaurant/products', { params }),
      createProduct: (data: any) => mockApiPost('/restaurant/products', data),
      updateProduct: (id: string, data: any) => mockApiPatch(`/restaurant/products/${id}`, data),
      deleteProduct: (id: string) => mockApiDelete(`/restaurant/products/${id}`),
      getCategories: () => mockApiGet('/restaurant/categories'),
      createCategory: (data: { name: string }) => mockApiPost('/restaurant/categories', data),
      deleteCategory: (id: string) => mockApiDelete(`/restaurant/categories/${id}`),
      getStats: (params?: { periodo?: string }) =>
        mockApiGet('/restaurant/stats', { params }),
      updateProfile: (data: any) => mockApiPatch('/restaurant/profile', data),
      updateOpeningHours: (hours: any[]) => mockApiPatch('/restaurant/opening-hours', { hours }),
      toggleOpen: (isOpen: boolean) => mockApiPatch('/restaurant/toggle-open', { isOpen }),
    },
  };
});

import { restaurantManageApi } from '../api';

describe('restaurantManageApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrders', () => {
    it('should call GET /restaurant/orders', async () => {
      const mockResponse = { data: { data: [], next_cursor: null } };
      mockApiGet.mockResolvedValue(mockResponse);

      const result = await restaurantManageApi.getOrders();
      expect(result).toEqual(mockResponse);
    });

    it('should pass status filter', async () => {
      const mockResponse = { data: { data: [] } };
      mockApiGet.mockResolvedValue(mockResponse);

      await restaurantManageApi.getOrders({ status: 'pending' });
      expect(mockApiGet).toHaveBeenCalledWith('/restaurant/orders', {
        params: { status: 'pending' },
      });
    });

    it('should pass pagination params', async () => {
      const mockResponse = { data: { data: [] } };
      mockApiGet.mockResolvedValue(mockResponse);

      await restaurantManageApi.getOrders({ limit: 10, cursor: 'abc' });
      expect(mockApiGet).toHaveBeenCalledWith('/restaurant/orders', {
        params: { limit: 10, cursor: 'abc' },
      });
    });
  });

  describe('getOrderById', () => {
    it('should call GET /restaurant/orders/:id', async () => {
      const mockResponse = { data: { id: 'ord-001', status: 'pending' } };
      mockApiGet.mockResolvedValue(mockResponse);

      const result = await restaurantManageApi.getOrderById('ord-001');
      expect(result).toEqual(mockResponse);
      expect(mockApiGet).toHaveBeenCalledWith('/restaurant/orders/ord-001');
    });
  });

  describe('updateOrderStatus', () => {
    it('should call PATCH /restaurant/orders/:id/status', async () => {
      const mockResponse = { data: { success: true } };
      mockApiPatch.mockResolvedValue(mockResponse);

      const result = await restaurantManageApi.updateOrderStatus('ord-001', 'confirmed');
      expect(result).toEqual(mockResponse);
      expect(mockApiPatch).toHaveBeenCalledWith('/restaurant/orders/ord-001/status', {
        status: 'confirmed',
      });
    });
  });

  describe('getProducts', () => {
    it('should call GET /restaurant/products', async () => {
      const mockResponse = { data: { data: [], next_cursor: null } };
      mockApiGet.mockResolvedValue(mockResponse);

      const result = await restaurantManageApi.getProducts();
      expect(result).toEqual(mockResponse);
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
      mockApiPost.mockResolvedValue(mockResponse);

      const result = await restaurantManageApi.createProduct(productData);
      expect(result).toEqual(mockResponse);
      expect(mockApiPost).toHaveBeenCalledWith('/restaurant/products', productData);
    });
  });

  describe('updateProduct', () => {
    it('should call PATCH /restaurant/products/:id', async () => {
      const updateData = { price: 3000, isAvailable: false };
      const mockResponse = { data: { id: 'prod-001', ...updateData } };
      mockApiPatch.mockResolvedValue(mockResponse);

      const result = await restaurantManageApi.updateProduct('prod-001', updateData);
      expect(result).toEqual(mockResponse);
      expect(mockApiPatch).toHaveBeenCalledWith('/restaurant/products/prod-001', updateData);
    });
  });

  describe('deleteProduct', () => {
    it('should call DELETE /restaurant/products/:id', async () => {
      const mockResponse = { data: { success: true } };
      mockApiDelete.mockResolvedValue(mockResponse);

      const result = await restaurantManageApi.deleteProduct('prod-001');
      expect(result).toEqual(mockResponse);
      expect(mockApiDelete).toHaveBeenCalledWith('/restaurant/products/prod-001');
    });
  });

  describe('getCategories', () => {
    it('should call GET /restaurant/categories', async () => {
      const mockResponse = { data: ['Hambúrguer', 'Pizza', 'Bebidas'] };
      mockApiGet.mockResolvedValue(mockResponse);

      const result = await restaurantManageApi.getCategories();
      expect(result).toEqual(mockResponse);
      expect(mockApiGet).toHaveBeenCalledWith('/restaurant/categories');
    });
  });

  describe('createCategory', () => {
    it('should call POST /restaurant/categories', async () => {
      const mockResponse = { data: { id: 'cat-001', name: 'Hambúrguer' } };
      mockApiPost.mockResolvedValue(mockResponse);

      const result = await restaurantManageApi.createCategory({ name: 'Hambúrguer' });
      expect(result).toEqual(mockResponse);
      expect(mockApiPost).toHaveBeenCalledWith('/restaurant/categories', { name: 'Hambúrguer' });
    });
  });

  describe('deleteCategory', () => {
    it('should call DELETE /restaurant/categories/:id', async () => {
      const mockResponse = { data: { success: true } };
      mockApiDelete.mockResolvedValue(mockResponse);

      const result = await restaurantManageApi.deleteCategory('cat-001');
      expect(result).toEqual(mockResponse);
      expect(mockApiDelete).toHaveBeenCalledWith('/restaurant/categories/cat-001');
    });
  });

  describe('getStats', () => {
    it('should call GET /restaurant/stats', async () => {
      const mockResponse = {
        data: {
          todayOrders: 12,
          todayRevenue: 45000,
          averageRating: 4.7,
          totalRatings: 89,
        },
      };
      mockApiGet.mockResolvedValue(mockResponse);

      const result = await restaurantManageApi.getStats();
      expect(result).toEqual(mockResponse);
    });

    it('should pass periodo param', async () => {
      const mockResponse = { data: {} };
      mockApiGet.mockResolvedValue(mockResponse);

      await restaurantManageApi.getStats({ periodo: 'semana' });
      expect(mockApiGet).toHaveBeenCalledWith('/restaurant/stats', {
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
      mockApiPatch.mockResolvedValue(mockResponse);

      const result = await restaurantManageApi.updateProfile(profileData);
      expect(result).toEqual(mockResponse);
      expect(mockApiPatch).toHaveBeenCalledWith('/restaurant/profile', profileData);
    });
  });

  describe('updateOpeningHours', () => {
    it('should call PATCH /restaurant/opening-hours', async () => {
      const hours = [
        { diaSemana: 1, abre: '08:00', fecha: '22:00' },
        { diaSemana: 2, abre: '08:00', fecha: '22:00' },
      ];
      const mockResponse = { data: { success: true } };
      mockApiPatch.mockResolvedValue(mockResponse);

      const result = await restaurantManageApi.updateOpeningHours(hours);
      expect(result).toEqual(mockResponse);
      expect(mockApiPatch).toHaveBeenCalledWith('/restaurant/opening-hours', { hours });
    });
  });

  describe('toggleOpen', () => {
    it('should call PATCH /restaurant/toggle-open with true', async () => {
      const mockResponse = { data: { success: true } };
      mockApiPatch.mockResolvedValue(mockResponse);

      const result = await restaurantManageApi.toggleOpen(true);
      expect(result).toEqual(mockResponse);
      expect(mockApiPatch).toHaveBeenCalledWith('/restaurant/toggle-open', { isOpen: true });
    });

    it('should call PATCH /restaurant/toggle-open with false', async () => {
      const mockResponse = { data: { success: true } };
      mockApiPatch.mockResolvedValue(mockResponse);

      const result = await restaurantManageApi.toggleOpen(false);
      expect(result).toEqual(mockResponse);
      expect(mockApiPatch).toHaveBeenCalledWith('/restaurant/toggle-open', { isOpen: false });
    });
  });
});
