import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { PaymentMethod } from "../types";
import { safeGetItem, safeSetItem } from "../utils/storage";

export const PAYMENT_METHODS_STORAGE_KEY = "pedeja_payment_methods_v1";

export interface PaymentMethodsState {
  hydrated: boolean;
  methods: PaymentMethod[];
}

const initialState: PaymentMethodsState = {
  hydrated: false,
  methods: [],
};

export const hydratePaymentMethods = createAsyncThunk(
  "paymentMethods/hydrate",
  async () => {
    const raw = await safeGetItem(PAYMENT_METHODS_STORAGE_KEY);
    if (!raw) {
      return [] as PaymentMethod[];
    }
    try {
      const parsed = JSON.parse(raw) as PaymentMethod[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
);

const paymentMethodsSlice = createSlice({
  name: "paymentMethods",
  initialState,
  reducers: {
    setDefaultPaymentMethod(state, action: PayloadAction<string>) {
      state.methods = state.methods.map((m) => ({
        ...m,
        isDefault: m.id === action.payload,
      }));
    },
    addPaymentMethod(state, action: PayloadAction<PaymentMethod>) {
      const incoming = action.payload;
      const next = state.methods.map((m) => ({
        ...m,
        isDefault: incoming.isDefault ? false : m.isDefault,
      }));
      next.push(incoming);
      if (!next.some((m) => m.isDefault) && next.length > 0) {
        next[0].isDefault = true;
      }
      state.methods = next;
    },
    removePaymentMethod(state, action: PayloadAction<string>) {
      const removedDefault = state.methods.find(
        (m) => m.id === action.payload && m.isDefault
      );
      state.methods = state.methods.filter((m) => m.id !== action.payload);
      if (
        removedDefault &&
        state.methods.length > 0 &&
        !state.methods.some((m) => m.isDefault)
      ) {
        state.methods[0].isDefault = true;
      }
    },
    replacePaymentMethods(state, action: PayloadAction<PaymentMethod[]>) {
      state.methods = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydratePaymentMethods.fulfilled, (state, action) => {
      state.methods = action.payload;
      state.hydrated = true;
    });
  },
});

export const {
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod,
  replacePaymentMethods,
} = paymentMethodsSlice.actions;

export const paymentMethodsReducer = paymentMethodsSlice.reducer;

export const selectPaymentMethods = (state: { paymentMethods: PaymentMethodsState }) =>
  state.paymentMethods.methods;

export const selectPaymentMethodsHydrated = (state: {
  paymentMethods: PaymentMethodsState;
}) => state.paymentMethods.hydrated;

export async function persistPaymentMethods(methods: PaymentMethod[]): Promise<void> {
  await safeSetItem(PAYMENT_METHODS_STORAGE_KEY, JSON.stringify(methods));
}
