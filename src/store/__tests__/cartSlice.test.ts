import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';

import {
  addItem,
  clearCart,
  decrementItem,
  hydrateCart,
  incrementItem,
  persistCart,
  removeItem,
  cartReducer,
  CART_STORAGE_KEY,
  type CartState,
} from '../cartSlice';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(async () => undefined),
  getItem: jest.fn(async () => null),
  removeItem: jest.fn(async () => undefined),
}));

const initialState: CartState = {
  items: [],
  restaurantId: null,
  hydrated: false,
};

const burger = {
  id: 'item-1',
  title: 'Burger Clássico',
  price: 2500,
  image: 'burger.png',
  restaurantId: 'rest-1',
};

const pizza = {
  id: 'item-2',
  title: 'Pizza Margherita',
  price: 3500,
  restaurantId: 'rest-2',
};

describe('cartSlice reducers', () => {
  it('adiciona um novo item com quantity 1 e define o restaurantId', () => {
    const state = cartReducer(initialState, addItem(burger));
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toMatchObject({ id: 'item-1', quantity: 1 });
    expect(state.restaurantId).toBe('rest-1');
  });

  it('incrementa a quantity quando o item já existe', () => {
    let state = cartReducer(initialState, addItem(burger));
    state = cartReducer(state, addItem(burger));
    expect(state.items[0].quantity).toBe(2);
    expect(state.items).toHaveLength(1);
  });

  it('limpa o carrinho ao adicionar item de outro restaurante', () => {
    let state = cartReducer(initialState, addItem(burger));
    state = cartReducer(state, addItem(pizza));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe('item-2');
    expect(state.restaurantId).toBe('rest-2');
  });

  it('incrementa e decrementa item por id', () => {
    let state = cartReducer(initialState, addItem(burger));
    state = cartReducer(state, incrementItem('item-1'));
    expect(state.items[0].quantity).toBe(2);
    state = cartReducer(state, decrementItem('item-1'));
    expect(state.items[0].quantity).toBe(1);
  });

  it('remove o item quando quantity chega a 0 via decrement', () => {
    let state = cartReducer(initialState, addItem(burger));
    state = cartReducer(state, decrementItem('item-1'));
    expect(state.items).toHaveLength(0);
    expect(state.restaurantId).toBeNull();
  });

  it('removeItem limpa restaurantId quando o carrinho esvazia', () => {
    let state = cartReducer(initialState, addItem(burger));
    state = cartReducer(state, removeItem('item-1'));
    expect(state.items).toHaveLength(0);
    expect(state.restaurantId).toBeNull();
  });

  it('removeItem de id inexistente não altera o conteúdo do estado', () => {
    const state = cartReducer(initialState, addItem(burger));
    const next = cartReducer(state, removeItem('nao-existe'));
    expect(next).toStrictEqual(state);
  });

  it('clearCart esvazia items e restaurantId', () => {
    let state = cartReducer(initialState, addItem(burger));
    state = cartReducer(state, clearCart());
    expect(state).toMatchObject({ items: [], restaurantId: null });
  });
});

describe('cartSlice hidratação', () => {
  // O thunk precisa ser despachado num store para que o payloadCreator execute.
  const makeStore = () => configureStore({ reducer: cartReducer });

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('hydrateCart com storage vazio marca hydrated e mantém carrinho vazio', async () => {
    const store = makeStore();
    await store.dispatch(hydrateCart());
    const state = store.getState();
    expect(state.hydrated).toBe(true);
    expect(state.items).toHaveLength(0);
    expect(state.restaurantId).toBeNull();
  });

  it('hydrateCart restaura items e restaurantId salvos', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({
        items: [{ id: 'item-1', title: 'Burger', price: 2500, quantity: 3 }],
        restaurantId: 'rest-9',
      })
    );
    const store = makeStore();
    await store.dispatch(hydrateCart());
    const state = store.getState();
    expect(state.hydrated).toBe(true);
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(3);
    expect(state.restaurantId).toBe('rest-9');
    expect(AsyncStorage.getItem).toHaveBeenCalledWith(CART_STORAGE_KEY);
  });

  it('hydrateCart descarta itens malformados', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({
        items: [
          { id: 'ok', title: 'Ok', price: 100, quantity: 1 },
          { id: 'bad', title: 'Bad', price: 'free', quantity: 0 },
          null,
        ],
        restaurantId: 'rest-1',
      })
    );
    const store = makeStore();
    await store.dispatch(hydrateCart());
    const state = store.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe('ok');
  });

  it('hydrateCart ignora JSON inválido', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('{not-json');
    const store = makeStore();
    await store.dispatch(hydrateCart());
    const state = store.getState();
    expect(state.hydrated).toBe(true);
    expect(state.items).toHaveLength(0);
  });

  it('não sobrescreve o estado depois que já hidratou', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({
        items: [{ id: 'remoto', title: 'Remoto', price: 999, quantity: 5 }],
        restaurantId: 'rest-remoto',
      })
    );
    const store = makeStore();
    await store.dispatch(hydrateCart());
    // Segunda hidratação (ex.: após logout) não deve regredir o carrinho local.
    await store.dispatch(hydrateCart());
    const state = store.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe('remoto');
    expect(state.restaurantId).toBe('rest-remoto');
  });

  it('hydrateCart.rejected também marca hydrated', () => {
    const rejected = {
      type: hydrateCart.rejected.type,
      payload: undefined,
      error: { name: 'Error', message: 'boom' },
    } as unknown as ReturnType<typeof hydrateCart.rejected>;
    const state = cartReducer(initialState, rejected);
    expect(state.hydrated).toBe(true);
    expect(state.items).toHaveLength(0);
  });
});

describe('persistCart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('grava items e restaurantId no storage', async () => {
    await persistCart({
      items: [{ id: 'item-1', title: 'Burger', price: 2500, quantity: 2 }],
      restaurantId: 'rest-1',
    });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      CART_STORAGE_KEY,
      JSON.stringify({
        items: [{ id: 'item-1', title: 'Burger', price: 2500, quantity: 2 }],
        restaurantId: 'rest-1',
      })
    );
  });

  it('não propaga erro quando o storage falha', async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('disk full'));
    await expect(
      persistCart({ items: [], restaurantId: null })
    ).resolves.toBeUndefined();
  });
});
