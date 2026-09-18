import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { safeGetItem, safeRemoveItem } from '../utils/storage';

export const BASE_URL = 'http://localhost:3000/v1';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await safeGetItem('authToken');
      if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
    } catch (error) { console.error('Error getting token:', error); }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await safeRemoveItem('authToken');
      await safeRemoveItem('user');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials: { identificador: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (data: { nome: string; email: string; telefone: string; password: string; role: string }) =>
    api.post('/auth/register', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data: { name?: string; phone?: string; avatar?: string }) =>
    api.patch('/users/me', data),
  logout: () => api.post('/auth/logout'),
  requestOtp: (telefone: string) => api.post('/auth/otp/request', { telefone }),
  verifyOtp: (telefone: string, codigo: string) =>
    api.post('/auth/otp/verify', { telefone, codigo }),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', {}, { headers: { Authorization: `Bearer ${refreshToken}` } }),
};

export const restaurantApi = {
  list: (params?: { categoria?: string; lat?: number; lng?: number; promocao?: boolean; cursor?: string; limit?: number }) =>
    api.get('/restaurants', { params }),
  getById: (id: string) => api.get(`/restaurants/${id}`),
  getProducts: (id: string, params?: { cursor?: string; limit?: number }) =>
    api.get(`/restaurants/${id}/products`, { params }),
  getCategories: (id: string) => api.get(`/restaurants/${id}/categories`),
};

export const orderApi = {
  create: (data: Record<string, unknown>, idempotencyKey?: string) =>
    api.post('/orders', data, {
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
      timeout: 45000,
    }),
  list: (params?: { status?: string; cursor?: string; limit?: number }) =>
    api.get('/orders', { params }),
  getActive: () => api.get('/orders/active'),
  getById: (id: string) => api.get(`/orders/${id}`),
  cancel: (id: string, motivo?: string) =>
    api.patch(`/orders/${id}/cancel`, motivo ? { motivo } : {}),
  rate: (id: string, data: { estrelas: number; comentario?: string; tags?: string[] }) =>
    api.post(`/orders/${id}/rating`, data),
  getRoute: (id: string) => api.get(`/orders/${id}/route`),
  getMessages: (id: string, params?: { cursor?: string; limit?: number }) =>
    api.get(`/orders/${id}/messages`, { params }),
  sendMessage: (id: string, texto: string, tipo: 'texto' | 'imagem' | 'sistema' = 'texto') =>
    api.post(`/orders/${id}/messages`, { texto, tipo }),
  markMessagesRead: (id: string, lastReadAt?: string) =>
    api.patch(`/orders/${id}/messages/read`, lastReadAt ? { lastReadAt } : {}),
  getUnreadMessages: (id: string) =>
    api.get(`/orders/${id}/messages/unread-count`),
};

export const promotionApi = {
  list: (params?: { cursor?: string; limit?: number }) =>
    api.get('/promotions', { params }),
  getCoupon: (codigo: string) => api.get(`/coupons/${codigo}`),
  validateCoupon: (codigo: string, subtotal: number) =>
    api.post('/checkout/validate-coupon', { codigo, subtotal }),
};

export const paymentApi = {
  initiate: (
    orderId: string,
    data: { methodType: string; phoneNumber?: string },
    idempotencyKey?: string
  ) =>
    api.post(`/orders/${orderId}/payments`, data, {
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
      timeout: 45000,
    }),
  get: (orderId: string, paymentId: string) =>
    api.get(`/orders/${orderId}/payments/${paymentId}`),
};

export const voipApi = {
  getConfig: () => api.get('/calls/config'),
  requestToken: (orderId: string) => api.post(`/orders/${orderId}/call/voip-token`),
  getHistory: (orderId: string) => api.get(`/orders/${orderId}/call/history`),
};

export const userApi = {
  getAddresses: (params?: { cursor?: string; limit?: number }) =>
    api.get('/users/me/addresses', { params }),
  addAddress: (data: { label: string; address: string; neighborhood: string; city: string; latitude: number; longitude: number; isDefault?: boolean }) =>
    api.post('/users/me/addresses', data),
  updateAddress: (id: string, data: { label: string; address: string; neighborhood: string; city: string; latitude: number; longitude: number; isDefault?: boolean }) =>
    api.patch(`/users/me/addresses/${id}`, data),
  deleteAddress: (id: string) => api.delete(`/users/me/addresses/${id}`),
  setDefaultAddress: (id: string) => api.patch(`/users/me/addresses/${id}/default`),
};

export const deliveryApi = {
  getAvailable: (params?: { cursor?: string; limit?: number }) =>
    api.get('/deliveries/available', { params }),
  acceptDelivery: (orderId: string, idempotencyKey?: string) =>
    api.post(`/deliveries/${orderId}/accept`, {}, {
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
    }),
  getDelivery: (orderId: string) => api.get(`/deliveries/${orderId}`),
  updateStatus: (orderId: string, status: string) =>
    api.patch(`/deliveries/${orderId}/status`, { status }),
  getHistory: (params?: { desde?: string; ate?: string; cursor?: string; limit?: number }) =>
    api.get('/deliveries/history', { params }),
  getEarnings: (params?: { periodo?: string }) =>
    api.get('/deliveries/earnings', { params }),
  toggleLocationSharing: (activo: boolean) =>
    api.patch('/entregadores/me/location-sharing', { activo }),
};

export const restaurantManageApi = {
  getOrders: (params?: { status?: string; cursor?: string; limit?: number }) =>
    api.get('/restaurant/orders', { params }),
  getOrderById: (id: string) => api.get(`/restaurant/orders/${id}`),
  updateOrderStatus: (orderId: string, status: string) =>
    api.patch(`/restaurant/orders/${orderId}/status`, { status }),
  getProducts: (params?: { cursor?: string; limit?: number }) =>
    api.get('/restaurant/products', { params }),
  createProduct: (data: { name: string; description: string; price: number; image?: string; category: string; isAvailable?: boolean; isFeatured?: boolean }) =>
    api.post('/restaurant/products', data),
  updateProduct: (id: string, data: { name?: string; description?: string; price?: number; image?: string; category?: string; isAvailable?: boolean; isFeatured?: boolean }) =>
    api.patch(`/restaurant/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/restaurant/products/${id}`),
  getCategories: () => api.get('/restaurant/categories'),
  createCategory: (data: { name: string }) =>
    api.post('/restaurant/categories', data),
  deleteCategory: (id: string) => api.delete(`/restaurant/categories/${id}`),
  getStats: (params?: { periodo?: string }) =>
    api.get('/restaurant/stats', { params }),
  updateProfile: (data: { name?: string; description?: string; phone?: string; image?: string; logo?: string; deliveryFee?: number; deliveryTime?: string }) =>
    api.patch('/restaurant/profile', data),
  updateOpeningHours: (hours: Array<{ diaSemana: number; abre: string; fecha: string }>) =>
    api.patch('/restaurant/opening-hours', { hours }),
  toggleOpen: (isOpen: boolean) =>
    api.patch('/restaurant/toggle-open', { isOpen }),
};

export default api;
