import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { Order } from '../types';
import { getOrders, saveOrders } from '../storage/orderStorage';

interface OrderState {
  items: Order[];
  loading: boolean;
}

const initialState: OrderState = {
  items: [],
  loading: false,
};

export const restoreOrders = createAsyncThunk(
  'orders/restoreOrders',
  async () => {
    return await getOrders();
  },
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (order: Order, { getState }) => {
    const state = getState() as {
      orders: OrderState;
    };

    const updatedOrders = [order, ...state.orders.items];

    await saveOrders(updatedOrders);

    return updatedOrders;
  },
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},

  extraReducers: builder => {
    builder
      .addCase(restoreOrders.pending, state => {
        state.loading = true;
      })
      .addCase(restoreOrders.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(restoreOrders.rejected, state => {
        state.loading = false;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export default orderSlice.reducer;
