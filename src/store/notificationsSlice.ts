import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type NotificationType = "order" | "delivery" | "promotion" | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

export interface NotificationsState {
  notifications: AppNotification[];
  unreadCount: number;
  initialized: boolean;
}

const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-001",
    type: "order",
    title: "Pedido Confirmado!",
    body: "Seu pedido em Burger Station foi confirmado e está sendo preparado.",
    data: { orderId: "order-005", status: "confirmed" },
    read: false,
    createdAt: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: "notif-002",
    type: "delivery",
    title: "Entregador a caminho!",
    body: "Carlos está a caminho com seu pedido #0005.",
    data: { orderId: "order-005", status: "delivering" },
    read: false,
    createdAt: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: "notif-003",
    type: "promotion",
    title: "Promoção exclusiva!",
    body: "Use o cupom PEDEJA20 e ganhe 20% de desconto no seu próximo pedido.",
    data: { code: "PEDEJA20" },
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "notif-004",
    type: "system",
    title: "Bem-vindo ao PedeJá!",
    body: "Complete seu perfil para uma experiência personalizada.",
    read: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

const initialState: NotificationsState = {
  notifications: MOCK_NOTIFICATIONS,
  unreadCount: MOCK_NOTIFICATIONS.filter((n) => !n.read).length,
  initialized: true,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification(state, action: PayloadAction<AppNotification>) {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    markAsRead(state, action: PayloadAction<string>) {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead(state) {
      state.notifications.forEach((n) => {
        n.read = true;
      });
      state.unreadCount = 0;
    },
    clearNotifications(state) {
      state.notifications = [];
      state.unreadCount = 0;
    },
    removeNotification(state, action: PayloadAction<string>) {
      const index = state.notifications.findIndex((n) => n.id === action.payload);
      if (index !== -1) {
        if (!state.notifications[index].read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  clearNotifications,
  removeNotification,
} = notificationsSlice.actions;

export const notificationsReducer = notificationsSlice.reducer;

export const selectNotifications = (state: { notifications: NotificationsState }) =>
  state.notifications.notifications;

export const selectUnreadCount = (state: { notifications: NotificationsState }) =>
  state.notifications.unreadCount;
