import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type CartLineItem = {
  id: string;
  title: string;
  price: number;
  image?: string;
  quantity: number;
};

export interface CartState {
  items: CartLineItem[];
  /** Restaurante atual do carrinho (para payload da API). */
  restaurantId: string | null;
}

const initialState: CartState = {
  items: [],
  restaurantId: null,
};

type AddCartItemPayload = {
  id: string;
  title: string;
  price: number;
  image?: string;
  restaurantId?: string;
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<AddCartItemPayload>) {
      const { restaurantId: rid, id, title, price, image } = action.payload;

      if (
        rid &&
        state.restaurantId &&
        state.restaurantId !== rid &&
        state.items.length > 0
      ) {
        state.items = [];
      }

      if (rid) {
        state.restaurantId = rid;
      }

      const existing = state.items.find((item) => item.id === id);

      if (existing) {
        existing.quantity += 1;
        return;
      }

      state.items.push({
        id,
        title,
        price,
        image,
        quantity: 1,
      });
    },
    incrementItem(state, action: PayloadAction<string>) {
      const item = state.items.find((entry) => entry.id === action.payload);

      if (item) {
        item.quantity += 1;
      }
    },
    decrementItem(state, action: PayloadAction<string>) {
      const item = state.items.find((entry) => entry.id === action.payload);

      if (!item) {
        return;
      }

      if (item.quantity <= 1) {
        state.items = state.items.filter(
          (entry) => entry.id !== action.payload
        );
        if (state.items.length === 0) {
          state.restaurantId = null;
        }
        return;
      }

      item.quantity -= 1;
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
      if (state.items.length === 0) {
        state.restaurantId = null;
      }
    },
    clearCart(state) {
      state.items = [];
      state.restaurantId = null;
    },
  },
});

export const {
  addItem,
  clearCart,
  decrementItem,
  incrementItem,
  removeItem,
} = cartSlice.actions;
export const cartReducer = cartSlice.reducer;

