import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type NotificationType = 'order' | 'delivery' | 'promotion' | 'system';

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

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  initialized: true,
};

const notificationsSlice = createSlice({
  name: 'notifications',
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
