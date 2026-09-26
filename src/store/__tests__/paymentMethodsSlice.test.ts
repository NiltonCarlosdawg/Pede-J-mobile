import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';

import {
  addMulticaixaReference,
  clearTransactions,
  createPaymentTransaction,
  hydratePaymentMethods,
  paymentMethodsReducer,
  persistPaymentMethods,
  replacePaymentMethods,
  selectPaymentMethods,
  selectPaymentMethodsHydrated,
  selectTransactionByOrder,
  selectTransactions,
  setDefaultPaymentMethod,
  updateTransactionStatus,
  PAYMENT_METHODS_STORAGE_KEY,
  type PaymentMethodsState,
} from '../paymentMethodsSlice';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(async () => undefined),
  getItem: jest.fn(async () => null),
  removeItem: jest.fn(async () => undefined),
}));

const initialState: PaymentMethodsState = {
  hydrated: false,
  methods: [],
  transactions: [],
};

const method = (id: string, isDefault = false) => ({
  id,
  type: 'paypay' as const,
  label: id.toUpperCase(),
  isDefault,
});

describe('paymentMethodsSlice reducers', () => {
  it('setDefaultPaymentMethod marca apenas o método escolhido', () => {
    const start = paymentMethodsReducer(
      initialState,
      replacePaymentMethods([method('a', true), method('b'), method('c')])
    );
    const state = paymentMethodsReducer(start, setDefaultPaymentMethod('c'));
    expect(state.methods.find((m) => m.isDefault)?.id).toBe('c');
    expect(state.methods.filter((m) => m.isDefault)).toHaveLength(1);
  });

  it('replacePaymentMethods substitui a lista inteira', () => {
    const state = paymentMethodsReducer(
      initialState,
      replacePaymentMethods([method('a'), method('b')])
    );
    expect(state.methods).toHaveLength(2);
  });

  it('createPaymentTransaction gera id e timestamp quando ausentes', () => {
    const state = paymentMethodsReducer(
      initialState,
      createPaymentTransaction({
        orderId: 'ord-1',
        methodType: 'paypay',
        amount: 2500,
        status: 'pending',
      })
    );
    expect(state.transactions).toHaveLength(1);
    expect(state.transactions[0].id).toMatch(/^tx-/);
    expect(state.transactions[0].timestamp).toBeTruthy();
  });

  it('createPaymentTransaction respeita id fornecido', () => {
    const state = paymentMethodsReducer(
      initialState,
      createPaymentTransaction({
        id: 'tx-custom',
        orderId: 'ord-1',
        methodType: 'paypay',
        amount: 2500,
        status: 'pending',
      })
    );
    expect(state.transactions[0].id).toBe('tx-custom');
  });

  it('updateTransactionStatus altera status e completedAt', () => {
    const start = paymentMethodsReducer(
      initialState,
      createPaymentTransaction({
        id: 'tx-1',
        orderId: 'ord-1',
        methodType: 'paypay',
        amount: 2500,
        status: 'pending',
      })
    );
    const state = paymentMethodsReducer(
      start,
      updateTransactionStatus({
        transactionId: 'tx-1',
        status: 'completed',
        completedAt: '2026-09-25T10:00:00.000Z',
      })
    );
    expect(state.transactions[0].status).toBe('completed');
    expect(state.transactions[0].completedAt).toBe('2026-09-25T10:00:00.000Z');
  });

  it('updateTransactionStatus ignora transactionId inexistente', () => {
    const state = paymentMethodsReducer(
      initialState,
      updateTransactionStatus({ transactionId: 'nope', status: 'completed' })
    );
    expect(state.transactions).toHaveLength(0);
  });

  it('addMulticaixaReference anexa a referência à transação', () => {
    const start = paymentMethodsReducer(
      initialState,
      createPaymentTransaction({
        id: 'tx-1',
        orderId: 'ord-1',
        methodType: 'multicaixa_express',
        amount: 2500,
        status: 'pending',
      })
    );
    const reference = {
      entity: '00471',
      entityName: 'Pede Já',
      reference: '991234567',
      amount: 2500,
      expiryDate: '2026-09-25T11:00:00.000Z',
    };
    const state = paymentMethodsReducer(
      start,
      addMulticaixaReference({ transactionId: 'tx-1', reference })
    );
    expect(state.transactions[0].reference).toEqual(reference);
  });

  it('clearTransactions esvazia a lista', () => {
    const start = paymentMethodsReducer(
      initialState,
      createPaymentTransaction({
        id: 'tx-1',
        orderId: 'ord-1',
        methodType: 'paypay',
        amount: 100,
        status: 'pending',
      })
    );
    const state = paymentMethodsReducer(start, clearTransactions());
    expect(state.transactions).toHaveLength(0);
  });
});

describe('paymentMethodsSlice hidratação', () => {
  const makeStore = () =>
    configureStore({ reducer: { paymentMethods: paymentMethodsReducer } });

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('mantém os métodos padrão quando o storage está vazio', async () => {
    const store = makeStore();
    await store.dispatch(hydratePaymentMethods());
    const state = store.getState().paymentMethods;
    expect(state.hydrated).toBe(true);
    expect(state.methods.length).toBeGreaterThan(0);
    expect(state.methods[0].id).toBe('pm-paypay');
  });

  it('restaura métodos salvos e descarta tipos inválidos', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify([
        { id: 'a', type: 'paypay', label: 'A', isDefault: true },
        { id: 'b', type: 'tipo-invalido', label: 'B', isDefault: false },
        null,
      ])
    );
    const store = makeStore();
    await store.dispatch(hydratePaymentMethods());
    const state = store.getState().paymentMethods;
    expect(state.methods).toHaveLength(1);
    expect(state.methods[0].id).toBe('a');
  });

  it('mantém os padrões quando o storage tem JSON inválido', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('{{{');
    const store = makeStore();
    await store.dispatch(hydratePaymentMethods());
    const state = store.getState().paymentMethods;
    expect(state.hydrated).toBe(true);
    expect(state.methods[0].id).toBe('pm-paypay');
  });

  it('mantém os padrões quando a lista restaurada é vazia', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify([{ id: 'x', type: 'inexistente', label: 'X', isDefault: false }])
    );
    const store = makeStore();
    await store.dispatch(hydratePaymentMethods());
    const state = store.getState().paymentMethods;
    expect(state.methods[0].id).toBe('pm-paypay');
  });
});

describe('persistPaymentMethods', () => {
  beforeEach(() => jest.clearAllMocks());

  it('serializa os métodos na chave correta', async () => {
    const methods = [method('a', true)];
    await persistPaymentMethods(methods);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      PAYMENT_METHODS_STORAGE_KEY,
      JSON.stringify(methods)
    );
  });
});

describe('seletores de paymentMethods', () => {
  const state = {
    paymentMethods: {
      hydrated: true,
      methods: [method('a', true), method('b')],
      transactions: [
        {
          id: 'tx-1',
          orderId: 'ord-1',
          methodType: 'paypay' as const,
          amount: 100,
          status: 'completed' as const,
          timestamp: '2026-09-25T10:00:00.000Z',
        },
      ],
    },
  };

  it('selectPaymentMethods e hydrated', () => {
    expect(selectPaymentMethods(state)).toHaveLength(2);
    expect(selectPaymentMethodsHydrated(state)).toBe(true);
  });

  it('selectTransactions e selectTransactionByOrder', () => {
    expect(selectTransactions(state)).toHaveLength(1);
    expect(selectTransactionByOrder(state, 'ord-1')?.id).toBe('tx-1');
    expect(selectTransactionByOrder(state, 'ord-x')).toBeUndefined();
  });
});
