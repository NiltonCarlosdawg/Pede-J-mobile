import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { apiSlice } from '../services/apiSlice';
import { authReducer } from './authSlice';
import { cartReducer } from './cartSlice';
import { chatReducer } from './chatSlice';
import { notificationsReducer } from './notificationsSlice';
import { ordersReducer } from './ordersSlice';
import {
  addPaymentMethod,
  persistPaymentMethods,
  paymentMethodsReducer,
  removePaymentMethod,
  replacePaymentMethods,
  setDefaultPaymentMethod,
} from './paymentMethodsSlice';
import { promotionsReducer } from './promotionsSlice';
import { ratingsReducer } from './ratingsSlice';

const paymentPersistListener = createListenerMiddleware();

paymentPersistListener.startListening({
  matcher: isAnyOf(
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    replacePaymentMethods
  ),
  effect: async (_action, listenerApi) => {
    const methods = (listenerApi.getState() as RootState).paymentMethods.methods;
    await persistPaymentMethods(methods);
  },
});

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    orders: ordersReducer,
    notifications: notificationsReducer,
    chat: chatReducer,
    ratings: ratingsReducer,
    promotions: promotionsReducer,
    paymentMethods: paymentMethodsReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(paymentPersistListener.middleware)
      .concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
