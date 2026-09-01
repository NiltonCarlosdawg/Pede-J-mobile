import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

import { notifyDriverOnTheWay, notifyOrderDelivered } from "../services/notifications";
import { playStatusChange } from "../utils/sounds";

export interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  price: number;
}

export interface OrderAddress {
  id: string;
  label: string;
  address: string;
  neighborhood: string;
  city: string;
}

import type { PaymentMethodType } from "../types";

export interface OrderPayment {
  id: string;
  type: PaymentMethodType;
  label: string;
}

export interface OrderDriver {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  vehicle?: string;
}

export interface DeliveryConfirmation {
  driverFinished: boolean;
  clientConfirmed: boolean;
  driverFinishedAt?: string;
  clientConfirmedAt?: string;
}

export type OrderStatus = "preparing" | "ready" | "delivering" | "delivered" | "cancelled";

export interface Order {
  id: string;
  items: OrderItem[];
  address: OrderAddress;
  payment: OrderPayment;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  estimatedDelivery?: string;
  driver?: OrderDriver;
  deliveryConfirmation?: DeliveryConfirmation;
}

export interface OrdersState {
  orders: Order[];
  currentOrder: Order | null;
}

const initialState: OrdersState = {
  orders: [],
  currentOrder: null,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    addOrder(state, action: PayloadAction<Order>) {
      state.orders.unshift(action.payload);
      state.currentOrder = action.payload;
    },
    setCurrentOrder(state, action: PayloadAction<Order | null>) {
      state.currentOrder = action.payload;
    },
    updateOrderStatus(
      state,
      action: PayloadAction<{ orderId: string; status: OrderStatus }>
    ) {
      const order = state.orders.find((o) => o.id === action.payload.orderId);
      if (order) {
        order.status = action.payload.status;
        playStatusChange();
      }
      if (
        state.currentOrder &&
        state.currentOrder.id === action.payload.orderId
      ) {
        state.currentOrder.status = action.payload.status;
      }
    },
    clearOrders(state) {
      state.orders = [];
      state.currentOrder = null;
    },
    loadOrders(state, action: PayloadAction<Order[]>) {
      state.orders = action.payload;
    },
    setOrderDriver(state, action: PayloadAction<{ orderId: string; driver: OrderDriver }>) {
      const order = state.orders.find((o) => o.id === action.payload.orderId);
      if (order) {
        order.driver = action.payload.driver;
      }
      if (state.currentOrder && state.currentOrder.id === action.payload.orderId) {
        state.currentOrder.driver = action.payload.driver;
      }
    },
    markDriverFinished(state, action: PayloadAction<string>) {
      const orderId = action.payload;
      const order = state.orders.find((o) => o.id === orderId);
      if (order) {
        if (!order.deliveryConfirmation) {
          order.deliveryConfirmation = { driverFinished: true, clientConfirmed: false };
        } else {
          order.deliveryConfirmation.driverFinished = true;
        }
        order.deliveryConfirmation.driverFinishedAt = new Date().toISOString();
      }
      if (state.currentOrder && state.currentOrder.id === orderId) {
        if (!state.currentOrder.deliveryConfirmation) {
          state.currentOrder.deliveryConfirmation = { driverFinished: true, clientConfirmed: false };
        } else {
          state.currentOrder.deliveryConfirmation.driverFinished = true;
        }
        state.currentOrder.deliveryConfirmation.driverFinishedAt = new Date().toISOString();
      }
    },
    markClientConfirmed(state, action: PayloadAction<string>) {
      const orderId = action.payload;
      const order = state.orders.find((o) => o.id === orderId);
      if (order) {
        if (!order.deliveryConfirmation) {
          order.deliveryConfirmation = { driverFinished: false, clientConfirmed: true };
        } else {
          order.deliveryConfirmation.clientConfirmed = true;
        }
        order.deliveryConfirmation.clientConfirmedAt = new Date().toISOString();
      }
      if (state.currentOrder && state.currentOrder.id === orderId) {
        if (!state.currentOrder.deliveryConfirmation) {
          state.currentOrder.deliveryConfirmation = { driverFinished: false, clientConfirmed: true };
        } else {
          state.currentOrder.deliveryConfirmation.clientConfirmed = true;
        }
        state.currentOrder.deliveryConfirmation.clientConfirmedAt = new Date().toISOString();
      }
    },
    finalizeDelivery(state, action: PayloadAction<string>) {
      const orderId = action.payload;
      const order = state.orders.find((o) => o.id === orderId);
      if (order) {
        order.status = "delivered";
        order.deliveryConfirmation = order.deliveryConfirmation ?? { driverFinished: true, clientConfirmed: true };
      }
      if (state.currentOrder && state.currentOrder.id === orderId) {
        state.currentOrder.status = "delivered";
        state.currentOrder.deliveryConfirmation = state.currentOrder.deliveryConfirmation ?? { driverFinished: true, clientConfirmed: true };
      }
    },
  },
});

export const {
  addOrder,
  setCurrentOrder,
  updateOrderStatus,
  clearOrders,
  loadOrders,
  setOrderDriver,
  markDriverFinished,
  markClientConfirmed,
  finalizeDelivery,
} = ordersSlice.actions;

export const ordersReducer = ordersSlice.reducer;

export const selectOrders = (state: { orders: OrdersState }) =>
  state.orders.orders;
export const selectCurrentOrder = (state: { orders: OrdersState }) =>
  state.orders.currentOrder;
export const selectOrdersCount = (state: { orders: OrdersState }) =>
  state.orders.orders.length;

// Async thunks with notifications
export const setOrderDelivering = createAsyncThunk(
  "orders/setDelivering",
  async ({ orderId, driverName }: { orderId: string; driverName: string }, { dispatch }) => {
    dispatch(updateOrderStatus({ orderId, status: "delivering" }));
    await notifyDriverOnTheWay(orderId, driverName);
  }
);

export const setOrderDelivered = createAsyncThunk(
  "orders/setDelivered",
  async (orderId: string, { dispatch }) => {
    dispatch(updateOrderStatus({ orderId, status: "delivered" }));
    await notifyOrderDelivered(orderId);
  }
);
