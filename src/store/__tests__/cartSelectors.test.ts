import {
  selectCartCount,
  selectCartItems,
  selectCartRestaurantId,
  selectCartSubtotal,
} from '../cartSelectors';
import { addItem, cartReducer, type CartState } from '../cartSlice';

const empty: CartState = { items: [], restaurantId: null, hydrated: false };

describe('cartSelectors', () => {
  const state: { cart: CartState } = {
    cart: {
      items: [
        { id: 'a', title: 'Burger', price: 2500, quantity: 2 },
        { id: 'b', title: 'Pizza', price: 3500, quantity: 1 },
      ],
      restaurantId: 'rest-1',
      hydrated: true,
    },
  };

  it('selectCartItems e selectCartRestaurantId', () => {
    expect(selectCartItems(state)).toHaveLength(2);
    expect(selectCartRestaurantId(state)).toBe('rest-1');
  });

  it('selectCartSubtotal soma price * quantity', () => {
    expect(selectCartSubtotal(state)).toBe(2500 * 2 + 3500 * 1);
  });

  it('selectCartCount soma as quantidades', () => {
    expect(selectCartCount(state)).toBe(3);
  });

  it('carrinho vazio devolve zeros', () => {
    const emptyState = { cart: empty };
    expect(selectCartSubtotal(emptyState)).toBe(0);
    expect(selectCartCount(emptyState)).toBe(0);
    expect(selectCartRestaurantId(emptyState)).toBeNull();
  });

  it('memoiza: a mesma referência de items devolve o mesmo subtotal', () => {
    const first = selectCartSubtotal(state);
    const second = selectCartSubtotal(state);
    expect(second).toBe(first);
    // referência de items nova → recalcula
    const newState = {
      cart: cartReducer(state.cart, addItem({ id: 'c', title: 'Suco', price: 500 })),
    };
    expect(selectCartSubtotal(newState)).toBe(2500 * 2 + 3500 + 500);
  });
});
