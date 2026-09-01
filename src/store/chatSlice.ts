import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ChatParticipant = "client" | "delivery" | "system";

export interface ChatMessage {
  id: string;
  orderId: string;
  sender: ChatParticipant;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface ChatState {
  messages: ChatMessage[];
  activeChats: string[]; // orderIds with active chat
}

const initialState: ChatState = {
  messages: [],
  activeChats: [],
};

const MAX_MESSAGES = 500;

function trimMessages(state: ChatState) {
  if (state.messages.length <= MAX_MESSAGES) return;
  state.messages.splice(0, state.messages.length - MAX_MESSAGES);
}

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    sendMessage(state, action: PayloadAction<Omit<ChatMessage, "id" | "timestamp" | "read">>) {
      const newMessage: ChatMessage = {
        ...action.payload,
        id: `msg-${Date.now()}`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      state.messages.push(newMessage);
      trimMessages(state);
      if (!state.activeChats.includes(action.payload.orderId)) {
        state.activeChats.push(action.payload.orderId);
      }
    },
    markMessagesAsRead(state, action: PayloadAction<string>) {
      state.messages
        .filter((m) => m.orderId === action.payload && m.sender !== "client")
        .forEach((m) => {
          m.read = true;
        });
    },
    addSystemMessage(
      state,
      action: PayloadAction<{ orderId: string; text: string }>
    ) {
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        orderId: action.payload.orderId,
        sender: "system",
        text: action.payload.text,
        timestamp: new Date().toISOString(),
        read: false,
      };
      state.messages.push(newMessage);
      trimMessages(state);
    },
    clearChat(state, action: PayloadAction<string>) {
      state.messages = state.messages.filter((m) => m.orderId !== action.payload);
      state.activeChats = state.activeChats.filter((id) => id !== action.payload);
    },
  },
});

export const { sendMessage, markMessagesAsRead, addSystemMessage, clearChat } =
  chatSlice.actions;

export const chatReducer = chatSlice.reducer;

const selectChatMessages = (state: { chat: ChatState }) => state.chat.messages;

export const selectMessagesByOrder = createSelector(
  [selectChatMessages, (state: { chat: ChatState }, orderId: string) => orderId],
  (messages, orderId) => messages.filter((m) => m.orderId === orderId)
);

export const selectUnreadMessages = createSelector(
  [selectChatMessages, (state: { chat: ChatState }, orderId: string) => orderId],
  (messages, orderId) =>
    messages.filter((m) => m.orderId === orderId && !m.read && m.sender !== "client")
);

export const selectActiveChats = (state: { chat: ChatState }) => state.chat.activeChats;

export const selectHasUnreadChat = (state: { chat: ChatState }, orderId: string) =>
  state.chat.messages.some(
    (m) => m.orderId === orderId && !m.read && m.sender !== "client"
  );
