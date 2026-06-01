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

const MOCK_ORDERS: Order[] = [
  {
    id: "order-001",
    items: [
      { id: "1", title: "Smash Burger Duplo", quantity: 2, price: 4500 },
      { id: "2", title: "Batata Frita Grande", quantity: 1, price: 2000 },
    ],
    address: { id: "addr1", label: "Casa", address: "Rua das Flores, 123", neighborhood: "Centro", city: "Luanda" },
    payment: { id: "pm-paypay", type: "paypay", label: "PayPay" },
    subtotal: 11000,
    deliveryFee: 0,
    discount: 0,
    total: 11000,
    status: "delivered",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "order-002",
    items: [
      { id: "3", title: "Pizza Quatro Queijos", quantity: 1, price: 7500 },
      { id: "4", title: "Refrigerante 2L", quantity: 1, price: 1500 },
    ],
    address: { id: "addr1", label: "Casa", address: "Rua das Flores, 123", neighborhood: "Centro", city: "Luanda" },
    payment: { id: "pm-multicaixa", type: "multicaixa_express", label: "Multicaixa Express" },
    subtotal: 9000,
    deliveryFee: 590,
    discount: 0,
    total: 9590,
    status: "delivered",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  // Pedidos ativos para simular múltiplos em andamento
  {
    id: "order-003",
    items: [
      { id: "5", title: "Sushi Mix 24 peças", quantity: 1, price: 8500 },
      { id: "6", title: "Missoshiro", quantity: 2, price: 1500 },
    ],
    address: { id: "addr1", label: "Casa", address: "Rua das Flores, 123", neighborhood: "Centro", city: "Luanda" },
    payment: { id: "pm-unitel", type: "unitel_money", label: "Unitel Money" },
    subtotal: 11500,
    deliveryFee: 800,
    discount: 500,
    total: 11800,
    status: "preparing",
    createdAt: new Date(Date.now() - 900000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 1800000).toISOString(),
  },
  {
    id: "order-004",
    items: [
      { id: "7", title: "Chicken Crispy", quantity: 1, price: 5500 },
      { id: "8", title: "Batata Rústica", quantity: 1, price: 3200 },
      { id: "9", title: "Coca-Cola 1.5L", quantity: 1, price: 1200 },
    ],
    address: { id: "addr2", label: "Trabalho", address: "Av. 4 de Fevereiro, 1000", neighborhood: "Ingombota", city: "Luanda" },
    payment: { id: "pm-facipay", type: "facipay", label: "FaciPay" },
    subtotal: 9900,
    deliveryFee: 0,
    discount: 0,
    total: 9900,
    status: "ready",
    createdAt: new Date(Date.now() - 600000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 900000).toISOString(),
  },
  {
    id: "order-005",
    items: [
      { id: "10", title: "Double Smash Bacon", quantity: 1, price: 7500 },
      { id: "11", title: "Milkshake Oreo", quantity: 2, price: 2800 },
    ],
    address: { id: "addr1", label: "Casa", address: "Rua das Flores, 123", neighborhood: "Centro", city: "Luanda" },
    payment: { id: "pm-paypay", type: "paypay", label: "PayPay" },
    subtotal: 13100,
    deliveryFee: 0,
    discount: 1000,
    total: 12100,
    status: "delivering",
    createdAt: new Date(Date.now() - 300000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 600000).toISOString(),
    driver: { id: "drv-001", name: "Carlos Mendes", phone: "+244 923 456 789", vehicle: "Honda CG 150 - ABC-1234" },
  },
];

const initialState: OrdersState = {
  orders: MOCK_ORDERS,
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
