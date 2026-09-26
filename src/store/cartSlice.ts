import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { safeGetItem, safeSetItem } from '../utils/storage';

export const CART_STORAGE_KEY = 'pedeja_cart_v1';

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
  /** Indica se o carrinho já foi restaurado do storage no boot do app. */
  hydrated: boolean;
}

const initialState: CartState = {
  items: [],
  restaurantId: null,
  hydrated: false,
};

type AddCartItemPayload = {
  id: string;
  title: string;
  price: number;
  image?: string;
  restaurantId?: string;
};

type PersistedCart = {
  items: CartLineItem[];
  restaurantId: string | null;
};

function isValidLineItem(value: unknown): value is CartLineItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<CartLineItem>;
  return (
    typeof item.id === 'string' &&
    item.id.length > 0 &&
    typeof item.title === 'string' &&
    typeof item.price === 'number' &&
    Number.isFinite(item.price) &&
    typeof item.quantity === 'number' &&
    Number.isFinite(item.quantity) &&
    item.quantity > 0
  );
}

/** Restaura o carrinho salvo no storage no boot do app. */
export const hydrateCart = createAsyncThunk('cart/hydrate', async () => {
  const empty: PersistedCart = { items: [], restaurantId: null };
  try {
    const raw = await safeGetItem(CART_STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<PersistedCart> | null;
    if (!parsed || typeof parsed !== 'object') return empty;
    const items = Array.isArray(parsed.items) ? parsed.items.filter(isValidLineItem) : [];
    const restaurantId = typeof parsed.restaurantId === 'string' ? parsed.restaurantId : null;
    return { items, restaurantId: items.length > 0 ? restaurantId : null };
  } catch {
    return empty;
  }
});

/** Grava o carrinho atual no storage. Chamada pelo listener de persistência. */
export async function persistCart(cart: PersistedCart): Promise<void> {
  try {
    await safeSetItem(
      CART_STORAGE_KEY,
      JSON.stringify({ items: cart.items, restaurantId: cart.restaurantId }),
    );
  } catch {
    // Storage indisponível: o carrinho segue apenas em memória.
  }
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<AddCartItemPayload>) {
      const { restaurantId: rid, id, title, price, image } = action.payload;

      if (rid && state.restaurantId && state.restaurantId !== rid && state.items.length > 0) {
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
        state.items = state.items.filter((entry) => entry.id !== action.payload);
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
  extraReducers: (builder) => {
    builder.addCase(hydrateCart.fulfilled, (state, action) => {
      // Só aplica na primeira hidratação; não sobrescreve alterações do usuário.
      if (state.hydrated) return;
      state.items = action.payload.items;
      state.restaurantId = action.payload.restaurantId;
      state.hydrated = true;
    });
    builder.addCase(hydrateCart.rejected, (state) => {
      state.hydrated = true;
    });
  },
});

export const { addItem, clearCart, decrementItem, incrementItem, removeItem } = cartSlice.actions;
export const cartReducer = cartSlice.reducer;
