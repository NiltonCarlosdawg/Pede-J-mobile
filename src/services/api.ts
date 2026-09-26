import axios, { create as createAxios, isAxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { clearDemoSession, loadDemoSession, saveDemoSession } from './demoAuth';
import { API_URL } from './config';

export const BASE_URL = API_URL;

const api: AxiosInstance = createAxios({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

type SessionRequest = InternalAxiosRequestConfig & { retried?: boolean; sessionUserId?: string };
const publicAuth = (url?: string) => /^\/auth\/(login|register|refresh|otp\/)/.test(url ?? '');

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      if (!publicAuth(config.url)) {
        const session = await loadDemoSession();
        const request = config as SessionRequest;
        if (request.sessionUserId && request.sessionUserId !== session?.user.id)
          throw new Error('Sessão alterada.');
        if (session) {
          config.headers.Authorization = `Bearer ${session.token}`;
          request.sessionUserId = session.user.id;
        }
      }
    } catch {
      throw new Error('Não foi possível aceder à sessão segura.');
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let refreshPromise: Promise<string> | null = null;
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as SessionRequest | undefined;
    if (error.response?.status === 401 && original && !publicAuth(original.url)) {
      const session = await loadDemoSession();
      if (original.sessionUserId !== session?.user.id) return Promise.reject(error);
      const requestToken = String(original.headers.Authorization ?? '');
      if (session && requestToken !== `Bearer ${session.token}` && !original.retried) {
        original.retried = true;
        return api(original);
      }
      if (!session) return Promise.reject(error);
      if (original.retried || !session.refreshToken) {
        await clearDemoSession();
        return Promise.reject(error);
      }
      try {
        if (!refreshPromise) {
          refreshPromise = (async () => {
            const response = await axios.post(
              `${BASE_URL}/auth/refresh`,
              { refreshToken: session.refreshToken },
              { timeout: 15000 },
            );
            if ((await loadDemoSession())?.token !== session.token)
              throw new Error('Sessão alterada.');
            if (typeof response.data.token !== 'string' || !response.data.token)
              throw new Error('Token inválido.');
            await saveDemoSession({
              ...session,
              token: response.data.token,
              refreshToken: response.data.refreshToken ?? session.refreshToken,
            });
            return response.data.token as string;
          })().finally(() => {
            refreshPromise = null;
          });
        }
        await refreshPromise;
        original.retried = true;
        return api(original);
      } catch (refreshError) {
        if (
          isAxiosError(refreshError) &&
          [400, 401, 403].includes(refreshError.response?.status ?? 0)
        ) {
          if ((await loadDemoSession())?.token === session.token) await clearDemoSession();
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  login: (credentials: { identificador: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (data: {
    nome: string;
    email: string;
    telefone: string;
    password: string;
    role: string;
  }) => api.post('/auth/register', data),
  getProfile: async () =>
    api.get('/auth/me', {
      headers: { Authorization: `Bearer ${(await loadDemoSession())?.token ?? ''}` },
    }),
  updateProfile: (data: { name?: string; phone?: string; avatar?: string }) =>
    api.patch('/users/me', data),
  logout: async () =>
    api.post(
      '/auth/logout',
      {},
      {
        headers: { Authorization: `Bearer ${(await loadDemoSession())?.token ?? ''}` },
        timeout: 5000,
      },
    ),
  requestOtp: (telefone: string) => api.post('/auth/otp/request', { telefone }),
  verifyOtp: (telefone: string, codigo: string) =>
    api.post('/auth/otp/verify', { telefone, codigo }),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
};

export const restaurantApi = {
  list: (params?: {
    categoria?: string;
    lat?: number;
    lng?: number;
    promocao?: boolean;
    cursor?: string;
    limit?: number;
  }) => api.get('/restaurants', { params }),
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
  getUnreadMessages: (id: string) => api.get(`/orders/${id}/messages/unread-count`),
};

export const promotionApi = {
  list: (params?: { cursor?: string; limit?: number }) => api.get('/promotions', { params }),
  getCoupon: (codigo: string) => api.get(`/coupons/${codigo}`),
  validateCoupon: (codigo: string, subtotal: number) =>
    api.post('/checkout/validate-coupon', { codigo, subtotal }),
};

export const paymentApi = {
  initiate: (
    orderId: string,
    data: { methodType: string; phoneNumber?: string },
    idempotencyKey?: string,
  ) =>
    api.post(`/orders/${orderId}/payments`, data, {
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
      timeout: 45000,
    }),
  get: (orderId: string, paymentId: string) => api.get(`/orders/${orderId}/payments/${paymentId}`),
};

export const voipApi = {
  getConfig: () => api.get('/calls/config'),
  requestToken: (orderId: string) => api.post(`/orders/${orderId}/call/voip-token`),
  getHistory: (orderId: string) => api.get(`/orders/${orderId}/call/history`),
};

export const userApi = {
  getAddresses: (params?: { cursor?: string; limit?: number }) =>
    api.get('/users/me/addresses', { params }),
  addAddress: (data: {
    label: string;
    address: string;
    neighborhood: string;
    city: string;
    latitude: number;
    longitude: number;
    isDefault?: boolean;
  }) => api.post('/users/me/addresses', data),
  updateAddress: (
    id: string,
    data: {
      label: string;
      address: string;
      neighborhood: string;
      city: string;
      latitude: number;
      longitude: number;
      isDefault?: boolean;
    },
  ) => api.patch(`/users/me/addresses/${id}`, data),
  deleteAddress: (id: string) => api.delete(`/users/me/addresses/${id}`),
  setDefaultAddress: (id: string) => api.patch(`/users/me/addresses/${id}/default`),
};

export const deliveryApi = {
  getAvailable: (params?: { cursor?: string; limit?: number }) =>
    api.get('/deliveries/available', { params }),
  acceptDelivery: (orderId: string, idempotencyKey?: string) =>
    api.post(
      `/deliveries/${orderId}/accept`,
      {},
      {
        headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
      },
    ),
  getDelivery: (orderId: string) => api.get(`/deliveries/${orderId}`),
  updateStatus: (orderId: string, status: string) =>
    api.patch(`/deliveries/${orderId}/status`, { status }),
  getHistory: (params?: { desde?: string; ate?: string; cursor?: string; limit?: number }) =>
    api.get('/deliveries/history', { params }),
  getEarnings: (params?: { periodo?: string }) => api.get('/deliveries/earnings', { params }),
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
  createProduct: (data: {
    name: string;
    description: string;
    price: number;
    image?: string;
    category: string;
    isAvailable?: boolean;
    isFeatured?: boolean;
  }) => api.post('/restaurant/products', data),
  updateProduct: (
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      image?: string;
      category?: string;
      isAvailable?: boolean;
      isFeatured?: boolean;
    },
  ) => api.patch(`/restaurant/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/restaurant/products/${id}`),
  getCategories: () => api.get('/restaurant/categories'),
  createCategory: (data: { name: string }) => api.post('/restaurant/categories', data),
  deleteCategory: (id: string) => api.delete(`/restaurant/categories/${id}`),
  getStats: (params?: { periodo?: string }) => api.get('/restaurant/stats', { params }),
  updateProfile: (data: {
    name?: string;
    description?: string;
    phone?: string;
    image?: string;
    logo?: string;
    deliveryFee?: number;
    deliveryTime?: string;
  }) => api.patch('/restaurant/profile', data),
  updateOpeningHours: (hours: { diaSemana: number; abre: string; fecha: string }[]) =>
    api.patch('/restaurant/opening-hours', { hours }),
  toggleOpen: (isOpen: boolean) => api.patch('/restaurant/toggle-open', { isOpen }),
};

export default api;
