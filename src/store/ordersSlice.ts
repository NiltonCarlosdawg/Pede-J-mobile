import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

import { notifyDriverOnTheWay, notifyOrderDelivered } from "../services/notifications";

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

export interface OrderPayment {
  id: string;
  type: string;
  label: string;
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
    payment: { id: "pm1", type: "credit_card", label: "MCX" },
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
    payment: { id: "pm2", type: "wallet", label: "Unitel Money" },
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
    payment: { id: "pm1", type: "credit_card", label: "MCX" },
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
    payment: { id: "pm3", type: "cash", label: "Dinheiro" },
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
    payment: { id: "pm2", type: "wallet", label: "Unitel Money" },
    subtotal: 13100,
    deliveryFee: 0,
    discount: 1000,
    total: 12100,
    status: "delivering",
    createdAt: new Date(Date.now() - 300000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 600000).toISOString(),
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
  },
});

export const {
  addOrder,
  setCurrentOrder,
  updateOrderStatus,
  clearOrders,
  loadOrders,
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
