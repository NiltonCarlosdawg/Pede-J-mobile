import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'https://pedej-api-{hash}.herokuapp.com/api/v1';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
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
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials: { email: string; password: string }) => api.post('/auth/login', credentials),
  register: (data: { name: string; email: string; password: string; phone?: string }) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: { name?: string; phone?: string; avatar?: string }) => api.put('/auth/profile', data),
};

export const restaurantApi = {
  list: (params?: { category?: string; search?: string }) => api.get('/restaurants', { params }),
  getById: (id: string) => api.get(`/restaurants/${id}`),
  getProducts: (id: string) => api.get(`/restaurants/${id}/products`),
  getCategories: (id: string) => api.get(`/restaurants/${id}/categories`),
};

export const orderApi = {
  create: (data: any) => api.post('/orders', data),
  list: () => api.get('/orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, status: string) => api.put(`/orders/${id}/status`, { status }),
};

export const userApi = {
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data: any) => api.post('/users/addresses', data),
  updateProfile: (data: { name?: string; phone?: string }) => api.put('/users/profile', data),
};

export const deliveryApi = {
  getAvailable: () => api.get('/deliveries/available'),
  acceptDelivery: (id: string) => api.post(`/deliveries/${id}/accept`),
  getEarnings: (params?: { startDate?: string; endDate?: string }) => api.get('/deliveries/earnings', { params }),
};

export default api;
