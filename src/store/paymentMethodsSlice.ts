import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { PaymentMethod, PaymentTransaction, MulticaixaExpressReference } from "../types";
import { safeGetItem, safeSetItem } from "../utils/storage";

export const PAYMENT_METHODS_STORAGE_KEY = "pedeja_payment_methods_v2";
export const PAYMENT_TRANSACTIONS_STORAGE_KEY = "pedeja_payment_transactions_v1";

export interface PaymentMethodsState {
  hydrated: boolean;
  methods: PaymentMethod[];
  transactions: PaymentTransaction[];
}

const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { id: "pm-paypay", type: "paypay", label: "PayPay", isDefault: true },
  { id: "pm-multicaixa", type: "multicaixa_express", label: "Multicaixa Express", isDefault: false },
  { id: "pm-unitel", type: "unitel_money", label: "Unitel Money", isDefault: false },
  { id: "pm-facipay", type: "facipay", label: "FaciPay", isDefault: false },
];

const initialState: PaymentMethodsState = {
  hydrated: false,
  methods: DEFAULT_PAYMENT_METHODS,
  transactions: [],
};

const VALID_METHOD_TYPES = ["paypay", "multicaixa_express", "unitel_money", "facipay"];

export const hydratePaymentMethods = createAsyncThunk(
  "paymentMethods/hydrate",
  async () => {
    const raw = await safeGetItem(PAYMENT_METHODS_STORAGE_KEY);
    if (!raw) {
      return [] as PaymentMethod[];
    }
    try {
      const parsed = JSON.parse(raw) as PaymentMethod[];
      if (!Array.isArray(parsed)) return [];
      const valid = parsed.filter((m) => m && VALID_METHOD_TYPES.includes(m.type));
      return valid.length > 0 ? valid : ([] as PaymentMethod[]);
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
    replacePaymentMethods(state, action: PayloadAction<PaymentMethod[]>) {
      state.methods = action.payload;
    },
    createPaymentTransaction(state, action: PayloadAction<Omit<PaymentTransaction, "id" | "timestamp">>) {
      const newTransaction: PaymentTransaction = {
        ...action.payload,
        id: `tx-${Date.now()}`,
        timestamp: new Date().toISOString(),
      };
      state.transactions.push(newTransaction);
    },
    updateTransactionStatus(
      state,
      action: PayloadAction<{ transactionId: string; status: PaymentTransaction["status"]; completedAt?: string }>
    ) {
      const tx = state.transactions.find((t) => t.id === action.payload.transactionId);
      if (tx) {
        tx.status = action.payload.status;
        if (action.payload.completedAt) {
          tx.completedAt = action.payload.completedAt;
        }
      }
    },
    addMulticaixaReference(state, action: PayloadAction<{ transactionId: string; reference: MulticaixaExpressReference }>) {
      const tx = state.transactions.find((t) => t.id === action.payload.transactionId);
      if (tx) {
        tx.reference = action.payload.reference;
      }
    },
    clearTransactions(state) {
      state.transactions = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydratePaymentMethods.fulfilled, (state, action) => {
      if (action.payload && action.payload.length > 0) {
        state.methods = action.payload;
      }
      state.hydrated = true;
    });
  },
});

export const {
  setDefaultPaymentMethod,
  replacePaymentMethods,
  createPaymentTransaction,
  updateTransactionStatus,
  addMulticaixaReference,
  clearTransactions,
} = paymentMethodsSlice.actions;

export const paymentMethodsReducer = paymentMethodsSlice.reducer;

export const selectPaymentMethods = (state: { paymentMethods: PaymentMethodsState }) =>
  state.paymentMethods.methods;

export const selectPaymentMethodsHydrated = (state: {
  paymentMethods: PaymentMethodsState;
}) => state.paymentMethods.hydrated;

export const selectTransactions = (state: { paymentMethods: PaymentMethodsState }) =>
  state.paymentMethods.transactions;

export const selectTransactionByOrder = (state: { paymentMethods: PaymentMethodsState }, orderId: string) =>
  state.paymentMethods.transactions.find((t) => t.orderId === orderId);

export async function persistPaymentMethods(methods: PaymentMethod[]): Promise<void> {
  await safeSetItem(PAYMENT_METHODS_STORAGE_KEY, JSON.stringify(methods));
}
