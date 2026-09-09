import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type RestaurantOrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "delivering" | "delivered" | "cancelled";

export interface RestaurantOrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface RestaurantOrder {
  id: string;
  clientName: string;
  clientPhone?: string;
  items: RestaurantOrderItem[];
  status: RestaurantOrderStatus;
  total: number;
  deliveryFee: number;
  deliveryAddress?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantStats {
  todayOrders: number;
  todayRevenue: number;
  weekOrders: number;
  weekRevenue: number;
  monthOrders: number;
  monthRevenue: number;
  averageRating: number;
  totalRatings: number;
}

export interface RestaurantOrdersState {
  orders: RestaurantOrder[];
  stats: RestaurantStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: RestaurantOrdersState = {
  orders: [],
  stats: null,
  loading: false,
  error: null,
};

const restaurantOrdersSlice = createSlice({
  name: "restaurantOrders",
  initialState,
  reducers: {
    setOrders(state, action: PayloadAction<RestaurantOrder[]>) {
      state.orders = action.payload;
    },
    addOrder(state, action: PayloadAction<RestaurantOrder>) {
      state.orders.unshift(action.payload);
    },
    updateOrderStatus(
      state,
      action: PayloadAction<{ orderId: string; status: RestaurantOrderStatus }>
    ) {
      const order = state.orders.find((o) => o.id === action.payload.orderId);
      if (order) {
        order.status = action.payload.status;
        order.updatedAt = new Date().toISOString();
      }
    },
    removeOrder(state, action: PayloadAction<string>) {
      state.orders = state.orders.filter((o) => o.id !== action.payload);
    },
    setStats(state, action: PayloadAction<RestaurantStats>) {
      state.stats = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearOrders(state) {
      state.orders = [];
      state.stats = null;
    },
  },
});

export const {
  setOrders,
  addOrder,
  updateOrderStatus,
  removeOrder,
  setStats,
  setLoading,
  setError,
  clearOrders,
} = restaurantOrdersSlice.actions;

export const restaurantOrdersReducer = restaurantOrdersSlice.reducer;

export const selectRestaurantOrders = (state: { restaurantOrders: RestaurantOrdersState }) =>
  state.restaurantOrders.orders;

export const selectRestaurantStats = (state: { restaurantOrders: RestaurantOrdersState }) =>
  state.restaurantOrders.stats;

export const selectRestaurantLoading = (state: { restaurantOrders: RestaurantOrdersState }) =>
  state.restaurantOrders.loading;

export const selectRestaurantError = (state: { restaurantOrders: RestaurantOrdersState }) =>
  state.restaurantOrders.error;

export const selectPendingOrders = (state: { restaurantOrders: RestaurantOrdersState }) =>
  state.restaurantOrders.orders.filter((o) => o.status === "pending");

export const selectPreparingOrders = (state: { restaurantOrders: RestaurantOrdersState }) =>
  state.restaurantOrders.orders.filter((o) => o.status === "confirmed" || o.status === "preparing");

export const selectReadyOrders = (state: { restaurantOrders: RestaurantOrdersState }) =>
  state.restaurantOrders.orders.filter((o) => o.status === "ready");

export const selectActiveOrders = (state: { restaurantOrders: RestaurantOrdersState }) =>
  state.restaurantOrders.orders.filter(
    (o) => o.status !== "delivered" && o.status !== "cancelled"
  );
