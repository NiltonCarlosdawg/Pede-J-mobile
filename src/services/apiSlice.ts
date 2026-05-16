import {
  createApi,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react';
import { safeGetItem } from '../utils/storage';

import { BASE_URL } from './api';
import type {
  Address,
  AuthResponse,
  Order,
  Product,
  Restaurant,
  User,
} from '../types';

type LoginCredentials = {
  email: string;
  password: string;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

type UpdateProfilePayload = {
  name?: string;
  phone?: string;
  avatar?: string;
};

type CreateOrderPayload = {
  restaurantId: string;
  items: Array<{
    productId: string;
    quantity: number;
    notes?: string;
  }>;
  addressId?: string;
  paymentMethod?: string;
};

type AddAddressPayload = {
  label: string;
  address: string;
  neighborhood: string;
  city: string;
  isDefault?: boolean;
};

type DeliveryEarningsParams = {
  startDate?: string;
  endDate?: string;
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
      query: () => '/auth/profile',
      providesTags: ['Auth'],
    }),
    updateProfile: builder.mutation<User, UpdateProfilePayload>({
      query: (body) => ({
        url: '/auth/profile',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    getRestaurants: builder.query<Restaurant[], { category?: string; search?: string; page?: number; limit?: number } | void>({
      query: (params) => ({
        url: '/restaurants',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Restaurant' as const, id })),
              { type: 'Restaurant' as const, id: 'LIST' },
            ]
          : [{ type: 'Restaurant' as const, id: 'LIST' }],
    }),
    getRestaurantById: builder.query<Restaurant, string>({
      query: (id) => `/restaurants/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Restaurant', id }],
    }),
    getRestaurantProducts: builder.query<Product[], string>({
      query: (restaurantId) => `/restaurants/${restaurantId}/products`,
    }),
    getRestaurantCategories: builder.query<string[], string>({
      query: (restaurantId) => `/restaurants/${restaurantId}/categories`,
    }),
    getOrders: builder.query<Order[], { page?: number; limit?: number; status?: string } | void>({
      query: (params) => ({
        url: '/orders',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Order' as const, id })),
              { type: 'Order' as const, id: 'LIST' },
            ]
          : [{ type: 'Order' as const, id: 'LIST' }],
    }),
    getOrdersPaginated: builder.query<{ data: Order[]; total: number; page: number; limit: number }, { page: number; limit: number; status?: string }>({
      query: (params) => ({
        url: '/orders',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Order' as const, id })),
              { type: 'Order' as const, id: 'LIST' },
            ]
          : [{ type: 'Order' as const, id: 'LIST' }],
      serializeQueryArgs: ({ queryArgs }) => {
        const { page: _, ...rest } = queryArgs;
        return JSON.stringify(rest);
      },
      merge: (currentCache, newItems) => {
        if (newItems.page === 1) {
          return newItems;
        }
        currentCache.data.push(...newItems.data);
        currentCache.page = newItems.page;
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        return currentArg?.page !== previousArg?.page;
      },
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
    getAddresses: builder.query<Address[], void>({
      query: () => '/users/addresses',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Address' as const, id })),
              { type: 'Address' as const, id: 'LIST' },
            ]
          : [{ type: 'Address' as const, id: 'LIST' }],
    }),
    addAddress: builder.mutation<Address, AddAddressPayload>({
      query: (body) => ({
        url: '/users/addresses',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Address', id: 'LIST' }],
    }),
    getAvailableDeliveries: builder.query<Order[], void>({
      query: () => '/deliveries/available',
      providesTags: [{ type: 'Delivery', id: 'LIST' }],
    }),
    acceptDelivery: builder.mutation<Order, string>({
      query: (id) => ({
        url: `/deliveries/${id}/accept`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Delivery', id: 'LIST' }],
    }),
    getEarnings: builder.query<unknown, DeliveryEarningsParams | void>({
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
  useGetOrdersPaginatedQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useGetAddressesQuery,
  useAddAddressMutation,
  useGetAvailableDeliveriesQuery,
  useAcceptDeliveryMutation,
  useGetEarningsQuery,
} = apiSlice;

