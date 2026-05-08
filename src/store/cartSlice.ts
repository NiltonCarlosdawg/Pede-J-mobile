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
}

const initialState: CartState = {
  items: [],
};

type AddCartItemPayload = {
  id: string;
  title: string;
  price: number;
  image?: string;
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<AddCartItemPayload>) {
      const existing = state.items.find(
        (item) => item.id === action.payload.id
      );

      if (existing) {
        existing.quantity += 1;
        return;
      }

      state.items.push({
        id: action.payload.id,
        title: action.payload.title,
        price: action.payload.price,
        image: action.payload.image,
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
        return;
      }

      item.quantity -= 1;
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearCart(state) {
      state.items = [];
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

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);
export const selectCartSubtotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
