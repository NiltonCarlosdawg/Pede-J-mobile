import { createApi } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/query/react';
import { isAxiosError } from 'axios';
import http from './api';

import type {
  Address,
  AddressPage,
  AuthResponse,
  ChatMessage,
  CouponValidationResponse,
  Earnings,
  Order,
  OrderPage,
  OrderRoute,
  PaginatedResponse,
  PaymentResponse,
  Product,
  ProductPage,
  PromotionSummary,
  Restaurant,
  RestaurantPage,
  User,
} from '../types';
import type { RestaurantStats } from '../store/restaurantOrdersSlice';

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

type OtpPayload = {
  telefone: string;
  codigo: string;
};

type UpdateProfilePayload = {
  name?: string;
  phone?: string;
  avatar?: string;
};

type CreateOrderPayload = {
  restaurantId: string;
  addressId: string;
  items: {
    productId: string;
    quantity: number;
    notes?: string;
  }[];
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

type ProductPayload = {
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  isAvailable?: boolean;
  isFeatured?: boolean;
};

type UpdateProductPayload = Partial<ProductPayload>;

type RestaurantProfilePayload = {
  name?: string;
  description?: string;
  phone?: string;
  image?: string;
  logo?: string;
  deliveryFee?: number;
  deliveryTime?: string;
};

type OpeningHoursPayload = { diaSemana: number; abre: string; fecha: string }[];

type DeliveryHistoryParams = {
  desde?: string;
  ate?: string;
  cursor?: string;
  limit?: number;
};

/** Erro normalizado produzido pelo baseQuery (formato consumido pelas telas). */
type NormalizedQueryError = {
  status: number | 'TIMEOUT_ERROR' | 'FETCH_ERROR' | 'CUSTOM_ERROR';
  data: { message: string; code?: string };
};

// Transporte via instância axios (interceptores de auth/refresh) — o
// fetchBaseQuery do RTK não é usado, apenas os tipos acima.
const baseQueryWithAuth: BaseQueryFn<FetchArgs | string, unknown, NormalizedQueryError> = async (
  args,
  api,
) => {
  const request = typeof args === 'string' ? { url: args } : args;
  try {
    const response = await http.request({
      url: request.url,
      method: request.method ?? 'GET',
      data: request.body,
      params: request.params,
      signal: api.signal,
      headers: request.headers as Record<string, string> | undefined,
    });
    return { data: response.data };
  } catch (error) {
    if (isAxiosError(error)) {
      const timedOut = error.code === 'ECONNABORTED';
      const data = (error.response?.data ?? {}) as Record<string, unknown>;
      return {
        error: {
          status: timedOut
            ? ('TIMEOUT_ERROR' as const)
            : (error.response?.status ?? ('FETCH_ERROR' as const)),
          data: {
            ...data,
            message:
              typeof data.message === 'string'
                ? data.message
                : timedOut
                  ? 'O servidor demorou muito a responder.'
                  : error.response
                    ? 'Não foi possível concluir o pedido ao servidor.'
                    : 'Sem conexão ao servidor.',
            // Preserva o `code` do backend (ex.: PHONE_NOT_VERIFIED, EMAIL_TAKEN)
            // e só recorre ao código axios quando o corpo não trouxer um.
            code: typeof data.code === 'string' ? data.code : error.code,
          },
        },
      };
    }
    return {
      error: {
        status: 'CUSTOM_ERROR' as const,
        data: { message: 'Não foi possível concluir o pedido ao servidor.' },
      },
    };
  }
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    'Auth',
    'Restaurant',
    'RestaurantOrder',
    'Menu',
    'Order',
    'Address',
    'Delivery',
    'Payment',
    'Promotion',
    'Chat',
  ],
  endpoints: (builder) => ({
    // ---------------------------------------------------------------- Auth
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
    requestOtp: builder.mutation<{ data?: unknown }, { telefone: string }>({
      query: (body) => ({
        url: '/auth/otp/request',
        method: 'POST',
        body,
      }),
    }),
    getOtpDevCode: builder.query<{ codigo?: string }, { telefone: string }>({
      // Apenas em desenvolvimento (usado pelas telas de auth em __DEV__).
      query: ({ telefone }) => ({
        url: '/auth/otp/dev-code',
        params: { telefone },
      }),
    }),
    verifyOtp: builder.mutation<AuthResponse, OtpPayload>({
      query: (body) => ({
        url: '/auth/otp/verify',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
        body: {},
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

    // ---------------------------------------------------------- Restaurants
    getRestaurants: builder.query<
      RestaurantPage,
      {
        categoria?: string;
        lat?: number;
        lng?: number;
        promocao?: boolean;
        cursor?: string;
        limit?: number;
      } | void
    >({
      query: (params) => ({
        url: '/restaurants',
        params: params || undefined,
      }),
      providesTags: (result) =>
        Array.isArray(result?.data)
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
    getMyRestaurant: builder.query<Restaurant, void>({
      // Perfil do restaurante autenticado (gestão).
      query: () => '/restaurants/me',
      providesTags: [{ type: 'Restaurant', id: 'ME' }],
    }),
    getRestaurantProducts: builder.query<ProductPage, string>({
      query: (restaurantId) => `/restaurants/${restaurantId}/products`,
      providesTags: [{ type: 'Menu', id: 'LIST' }],
    }),
    getRestaurantCategories: builder.query<string[], string>({
      query: (restaurantId) => `/restaurants/${restaurantId}/categories`,
    }),

    // ---------------------------------------------------------------- Orders
    getOrders: builder.query<
      OrderPage,
      { status?: string; cursor?: string; limit?: number } | void
    >({
      query: (params) => ({
        url: '/orders',
        params: params || undefined,
      }),
      providesTags: (result) =>
        Array.isArray(result?.data)
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
    getOrderRoute: builder.query<OrderRoute, string>({
      query: (id) => `/orders/${id}/route`,
      providesTags: (_result, _error, id) => [{ type: 'Order', id }],
    }),

    // ----------------------------------------------------------------- Chat
    getMessages: builder.query<
      ChatMessage[] | PaginatedResponse<ChatMessage>,
      { orderId: string; cursor?: string; limit?: number }
    >({
      query: ({ orderId, ...params }) => ({
        url: `/orders/${orderId}/messages`,
        params,
      }),
      providesTags: (_result, _error, { orderId }) => [{ type: 'Chat', id: orderId }],
    }),
    sendMessage: builder.mutation<
      ChatMessage,
      { orderId: string; texto: string; tipo?: 'texto' | 'imagem' | 'sistema' }
    >({
      query: ({ orderId, ...body }) => ({
        url: `/orders/${orderId}/messages`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { orderId }) => [{ type: 'Chat', id: orderId }],
    }),
    markMessagesRead: builder.mutation<void, { orderId: string; lastReadAt?: string }>({
      query: ({ orderId, lastReadAt }) => ({
        url: `/orders/${orderId}/messages/read`,
        method: 'PATCH',
        body: lastReadAt ? { lastReadAt } : {},
      }),
      invalidatesTags: (_result, _error, { orderId }) => [{ type: 'Chat', id: orderId }],
    }),
    getUnreadMessages: builder.query<{ unreadCount: number }, string>({
      query: (orderId) => `/orders/${orderId}/messages/unread-count`,
      providesTags: (_result, _error, orderId) => [{ type: 'Chat', id: orderId }],
    }),

    // ----------------------------------------------------------- Promotions
    getPromotions: builder.query<
      PromotionSummary[] | PaginatedResponse<PromotionSummary>,
      { cursor?: string; limit?: number } | void
    >({
      query: (params) => ({
        url: '/promotions',
        params: params || undefined,
      }),
      providesTags: [{ type: 'Promotion', id: 'LIST' }],
    }),
    validateCoupon: builder.mutation<
      CouponValidationResponse,
      { codigo: string; subtotal: number }
    >({
      query: (body) => ({
        url: '/checkout/validate-coupon',
        method: 'POST',
        body,
      }),
    }),

    // -------------------------------------------------------------- Payments
    initiatePayment: builder.mutation<
      { payment: PaymentResponse },
      {
        orderId: string;
        body: { methodType: string; phoneNumber?: string };
        idempotencyKey?: string;
      }
    >({
      query: ({ orderId, body, idempotencyKey }) => ({
        url: `/orders/${orderId}/payments`,
        method: 'POST',
        body,
        headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
      }),
      invalidatesTags: (_result, _error, { orderId }) => [{ type: 'Order', id: orderId }],
    }),
    getPayment: builder.query<{ payment: PaymentResponse }, { orderId: string; paymentId: string }>(
      {
        query: ({ orderId, paymentId }) => `/orders/${orderId}/payments/${paymentId}`,
        providesTags: (_result, _error, { paymentId }) => [{ type: 'Payment', id: paymentId }],
      },
    ),

    // ------------------------------------------------------------- Addresses
    getAddresses: builder.query<AddressPage, { cursor?: string; limit?: number } | void>({
      query: (params) => ({
        url: '/users/me/addresses',
        params: params || undefined,
      }),
      providesTags: (result) => {
        const list: Address[] | undefined = Array.isArray(result as unknown as Address[])
          ? (result as unknown as Address[])
          : (result as AddressPage | undefined)?.data;
        return Array.isArray(list) && list.length
          ? [
              ...list.map(({ id }) => ({ type: 'Address' as const, id })),
              { type: 'Address' as const, id: 'LIST' },
            ]
          : [{ type: 'Address' as const, id: 'LIST' }];
      },
    }),
    addAddress: builder.mutation<Address, AddAddressPayload>({
      query: (body) => ({
        url: '/users/me/addresses',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Address', id: 'LIST' }],
    }),

    // ------------------------------------------------------------- Delivery
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
    getDelivery: builder.query<Order, string>({
      // Compatível com o comportamento anterior: tenta /deliveries/:id e,
      // se falhar, cai para /orders/:id. Normaliza `{ order }` -> `Order`.
      async queryFn(orderId, _api, _extraOptions, baseQuery) {
        const primary = await baseQuery({ url: `/deliveries/${orderId}` });
        const fallback =
          'error' in primary && primary.error
            ? await baseQuery({ url: `/orders/${orderId}` })
            : primary;
        if ('error' in fallback && fallback.error) return { error: fallback.error };
        const data = fallback.data as Order | { order?: Order };
        const order =
          data && typeof data === 'object' && 'order' in data && data.order
            ? data.order
            : (data as Order);
        return { data: order };
      },
      providesTags: (_result, _error, orderId) => [
        { type: 'Delivery', id: orderId },
        { type: 'Order', id: orderId },
      ],
    }),
    updateDeliveryStatus: builder.mutation<Order, { orderId: string; status: string }>({
      query: ({ orderId, status }) => ({
        url: `/deliveries/${orderId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_result, _error, { orderId }) => [
        { type: 'Delivery', id: 'LIST' },
        { type: 'Delivery', id: orderId },
        { type: 'Order', id: orderId },
        { type: 'Order', id: 'LIST' },
      ],
    }),
    getDeliveryHistory: builder.query<OrderPage | Order[], DeliveryHistoryParams | void>({
      query: (params) => ({
        url: '/deliveries/history',
        params: params || undefined,
      }),
      providesTags: [{ type: 'Delivery', id: 'LIST' }],
    }),
    getEarnings: builder.query<Earnings, EarningsParams | void>({
      query: (params) => ({
        url: '/deliveries/earnings',
        params: params || undefined,
      }),
    }),
    toggleLocationSharing: builder.mutation<void, boolean>({
      query: (activo) => ({
        url: '/entregadores/me/location-sharing',
        method: 'PATCH',
        body: { activo },
      }),
    }),

    // ------------------------------------------------------ Restaurant (gestão)
    getRestaurantOrders: builder.query<
      OrderPage | Order[],
      { status?: string; cursor?: string; limit?: number } | void
    >({
      query: (params) => ({
        url: '/restaurant/orders',
        params: params || undefined,
      }),
      providesTags: (result) => {
        const list = Array.isArray((result as OrderPage | undefined)?.data)
          ? (result as OrderPage).data
          : Array.isArray(result as Order[])
            ? (result as Order[])
            : [];
        return list.length
          ? [
              ...list.map(({ id }) => ({ type: 'RestaurantOrder' as const, id })),
              { type: 'RestaurantOrder' as const, id: 'LIST' },
            ]
          : [{ type: 'RestaurantOrder' as const, id: 'LIST' }];
      },
    }),
    updateRestaurantOrderStatus: builder.mutation<Order, { orderId: string; status: string }>({
      query: ({ orderId, status }) => ({
        url: `/restaurant/orders/${orderId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_result, _error, { orderId }) => [
        { type: 'RestaurantOrder', id: 'LIST' },
        { type: 'RestaurantOrder', id: orderId },
        { type: 'Order', id: orderId },
      ],
    }),
    getRestaurantStats: builder.query<RestaurantStats, { periodo?: string } | void>({
      query: (params) => ({
        url: '/restaurant/stats',
        params: params || undefined,
      }),
      providesTags: [{ type: 'RestaurantOrder', id: 'STATS' }],
    }),
    getManageProducts: builder.query<
      ProductPage | Product[],
      { cursor?: string; limit?: number } | void
    >({
      query: (params) => ({
        url: '/restaurant/products',
        params: params || undefined,
      }),
      providesTags: (result) => {
        const list = Array.isArray((result as ProductPage | undefined)?.data)
          ? (result as ProductPage).data
          : Array.isArray(result as Product[])
            ? (result as Product[])
            : [];
        return list.length
          ? [
              ...list.map(({ id }) => ({ type: 'Menu' as const, id })),
              { type: 'Menu' as const, id: 'LIST' },
            ]
          : [{ type: 'Menu' as const, id: 'LIST' }];
      },
    }),
    createProduct: builder.mutation<Product, ProductPayload>({
      query: (body) => ({
        url: '/restaurant/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Menu', id: 'LIST' },
        { type: 'RestaurantOrder', id: 'STATS' },
      ],
    }),
    updateProduct: builder.mutation<Product, { productId: string; payload: UpdateProductPayload }>({
      query: ({ productId, payload }) => ({
        url: `/restaurant/products/${productId}`,
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: (_result, _error, { productId }) => [
        { type: 'Menu', id: 'LIST' },
        { type: 'Menu', id: productId },
      ],
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (productId) => ({
        url: `/restaurant/products/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Menu', id: 'LIST' }],
    }),
    updateRestaurantProfile: builder.mutation<void, RestaurantProfilePayload>({
      query: (body) => ({
        url: '/restaurant/profile',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [{ type: 'Restaurant', id: 'LIST' }],
    }),
    updateOpeningHours: builder.mutation<void, OpeningHoursPayload>({
      query: (hours) => ({
        url: '/restaurant/opening-hours',
        method: 'PATCH',
        body: { hours },
      }),
      invalidatesTags: [{ type: 'Restaurant', id: 'LIST' }],
    }),
    toggleOpen: builder.mutation<void, boolean>({
      query: (isOpen) => ({
        url: '/restaurant/toggle-open',
        method: 'PATCH',
        body: { isOpen },
      }),
      invalidatesTags: [{ type: 'Restaurant', id: 'LIST' }],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRequestOtpMutation,
  useLazyGetOtpDevCodeQuery,
  useVerifyOtpMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetRestaurantsQuery,
  useGetRestaurantByIdQuery,
  useLazyGetMyRestaurantQuery,
  useGetRestaurantProductsQuery,
  useGetRestaurantCategoriesQuery,
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useGetOrderRouteQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkMessagesReadMutation,
  useGetUnreadMessagesQuery,
  useGetPromotionsQuery,
  useValidateCouponMutation,
  useInitiatePaymentMutation,
  useGetPaymentQuery,
  useGetAddressesQuery,
  useAddAddressMutation,
  useGetAvailableDeliveriesQuery,
  useAcceptDeliveryMutation,
  useGetDeliveryQuery,
  useUpdateDeliveryStatusMutation,
  useGetDeliveryHistoryQuery,
  useGetEarningsQuery,
  useToggleLocationSharingMutation,
  useGetRestaurantOrdersQuery,
  useUpdateRestaurantOrderStatusMutation,
  useGetRestaurantStatsQuery,
  useGetManageProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUpdateRestaurantProfileMutation,
  useUpdateOpeningHoursMutation,
  useToggleOpenMutation,
} = apiSlice;
