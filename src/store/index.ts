import { combineReducers, configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { apiSlice } from '../services/apiSlice';
import { authReducer, clearSession, hydrateSession } from './authSlice';
import { onSessionChange } from '../services/demoAuth';
import { disconnectRealtime } from '../services/realtime';
import { cartReducer } from './cartSlice';
import { chatReducer } from './chatSlice';
import { notificationsReducer } from './notificationsSlice';
import { ordersReducer } from './ordersSlice';
import {
  persistPaymentMethods,
  paymentMethodsReducer,
  replacePaymentMethods,
  setDefaultPaymentMethod,
} from './paymentMethodsSlice';
import { promotionsReducer } from './promotionsSlice';
import { ratingsReducer } from './ratingsSlice';
import { restaurantOrdersReducer } from './restaurantOrdersSlice';

const paymentPersistListener = createListenerMiddleware();

paymentPersistListener.startListening({
  matcher: isAnyOf(
    setDefaultPaymentMethod,
    replacePaymentMethods
  ),
  effect: async (_action, listenerApi) => {
    const methods = (listenerApi.getState() as RootState).paymentMethods.methods;
    await persistPaymentMethods(methods);
  },
});

const appReducer = combineReducers({
    auth: authReducer,
    cart: cartReducer,
    orders: ordersReducer,
    notifications: notificationsReducer,
    chat: chatReducer,
    ratings: ratingsReducer,
    promotions: promotionsReducer,
    paymentMethods: paymentMethodsReducer,
    restaurantOrders: restaurantOrdersReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
});

export const store = configureStore({
  reducer: (state: ReturnType<typeof appReducer> | undefined, action: Parameters<typeof appReducer>[1]) =>
    appReducer(clearSession.match(action) ? undefined : state, action),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(paymentPersistListener.middleware)
      .concat(apiSlice.middleware),
});

onSessionChange((session) => {
  const previousUser = store.getState().auth.user?.id;
  if (!session || (previousUser && previousUser !== session.user.id)) {
    disconnectRealtime();
    store.dispatch(clearSession());
  }
  if (session) store.dispatch(hydrateSession(session));
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
