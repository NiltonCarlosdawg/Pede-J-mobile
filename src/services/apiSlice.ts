import {
  createApi,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react';
import { safeGetItem } from '../utils/storage';

import { BASE_URL } from './api';
import type {
  Address,
  AddressPage,
  AuthResponse,
  Earnings,
  Order,
  OrderPage,
  Product,
  ProductPage,
  Restaurant,
  RestaurantPage,
  User,
} from '../types';

type LoginCredentials = {
  identificador: string;
  password: string;
};

type RegisterPayload = {
  nome: string;
  email: string;
  telefone: string;
  password: string;
  role: string;
};

type UpdateProfilePayload = {
  name?: string;
  phone?: string;
  avatar?: string;
};

type CreateOrderPayload = {
  restaurantId: string;
  addressId: string;
  items: Array<{
    productId: string;
    quantity: number;
    notes?: string;
  }>;
  cupomAplicado?: string;
};

type AddAddressPayload = {
  label: string;
  address: string;
  neighborhood: string;
  city: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
};

type EarningsParams = {
  periodo?: string;
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

const baseQueryWithAuth = async (args: Parameters<typeof rawBaseQuery>[0], api: Parameters<typeof rawBaseQuery>[1], extraOptions: Parameters<typeof rawBaseQuery>[2]) => {
  const token = await safeGetItem('authToken');

  if (!token) {
    return rawBaseQuery(args, api, extraOptions);
  }

  const requestArgs =
    typeof args === 'string'
      ? {
          url: args,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : {
          ...args,
          headers: {
            ...(args.headers || {}),
            Authorization: `Bearer ${token}`,
          },
        };

  return rawBaseQuery(requestArgs, api, extraOptions);
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Auth', 'Restaurant', 'Order', 'Address', 'Delivery'],
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    register: builder.mutation<AuthResponse, RegisterPayload>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    getProfile: builder.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['Auth'],
    }),
    updateProfile: builder.mutation<User, UpdateProfilePayload>({
      query: (body) => ({
        url: '/users/me',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    getRestaurants: builder.query<RestaurantPage, { categoria?: string; lat?: number; lng?: number; promocao?: boolean; cursor?: string; limit?: number } | void>({
      query: (params) => ({
        url: '/restaurants',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Restaurant' as const, id })),
              { type: 'Restaurant' as const, id: 'LIST' },
            ]
          : [{ type: 'Restaurant' as const, id: 'LIST' }],
    }),
    getRestaurantById: builder.query<Restaurant, string>({
      query: (id) => `/restaurants/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Restaurant', id }],
    }),
    getRestaurantProducts: builder.query<ProductPage, string>({
      query: (restaurantId) => `/restaurants/${restaurantId}/products`,
    }),
    getRestaurantCategories: builder.query<string[], string>({
      query: (restaurantId) => `/restaurants/${restaurantId}/categories`,
    }),
    getOrders: builder.query<OrderPage, { status?: string; cursor?: string; limit?: number } | void>({
      query: (params) => ({
        url: '/orders',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Order' as const, id })),
              { type: 'Order' as const, id: 'LIST' },
            ]
          : [{ type: 'Order' as const, id: 'LIST' }],
    }),
    getOrderById: builder.query<Order, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Order', id }],
    }),
    createOrder: builder.mutation<Order, CreateOrderPayload & { idempotencyKey?: string }>({
      query: ({ idempotencyKey, ...body }) => ({
        url: '/orders',
        method: 'POST',
        body,
        headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
      }),
      invalidatesTags: [{ type: 'Order', id: 'LIST' }],
    }),
    getAddresses: builder.query<AddressPage, { cursor?: string; limit?: number } | void>({
      query: (params) => ({
        url: '/users/me/addresses',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Address' as const, id })),
              { type: 'Address' as const, id: 'LIST' },
            ]
          : [{ type: 'Address' as const, id: 'LIST' }],
    }),
    addAddress: builder.mutation<Address, AddAddressPayload>({
      query: (body) => ({
        url: '/users/me/addresses',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Address', id: 'LIST' }],
    }),
    getAvailableDeliveries: builder.query<OrderPage, { cursor?: string; limit?: number } | void>({
      query: (params) => ({
        url: '/deliveries/available',
        params: params || undefined,
      }),
      providesTags: [{ type: 'Delivery', id: 'LIST' }],
    }),
    acceptDelivery: builder.mutation<Order, { orderId: string; idempotencyKey?: string }>({
      query: ({ orderId, idempotencyKey }) => ({
        url: `/deliveries/${orderId}/accept`,
        method: 'POST',
        headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
      }),
      invalidatesTags: [{ type: 'Delivery', id: 'LIST' }],
    }),
    getEarnings: builder.query<Earnings, EarningsParams | void>({
      query: (params) => ({
        url: '/deliveries/earnings',
        params: params || undefined,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetRestaurantsQuery,
  useGetRestaurantByIdQuery,
  useGetRestaurantProductsQuery,
  useGetRestaurantCategoriesQuery,
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useGetAddressesQuery,
  useAddAddressMutation,
  useGetAvailableDeliveriesQuery,
  useAcceptDeliveryMutation,
  useGetEarningsQuery,
} = apiSlice;
