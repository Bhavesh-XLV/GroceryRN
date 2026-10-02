import { configureStore } from '@reduxjs/toolkit';

import { apiSlice } from '../api/apiSlice';
import appReducer from './appSlice';
import authReducer from './authSlice';
import favoriteReducer from './favoriteSlice';
import cartReducer from './cartSlice';
import orderReducer from './orderSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    favorites: favoriteReducer,
    cart: cartReducer,
    orders: orderReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },

  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
