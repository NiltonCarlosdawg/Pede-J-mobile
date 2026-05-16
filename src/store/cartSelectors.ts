import { createSelector } from "@reduxjs/toolkit";

import type { CartState } from "./cartSlice";

type CartRoot = { cart: CartState };

export const selectCartItems = (state: CartRoot) => state.cart.items;

export const selectCartRestaurantId = (state: CartRoot) => state.cart.restaurantId;

export const selectCartSubtotal = createSelector([selectCartItems], (items) =>
  items.reduce((total, item) => total + item.price * item.quantity, 0)
);

export const selectCartCount = createSelector([selectCartItems], (items) =>
  items.reduce((total, item) => total + item.quantity, 0)
);
