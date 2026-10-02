import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Product } from '../types';
import { clearCartStorage, getCart, saveCart } from '../storage/cartStorage';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
}

const initialState: CartState = {
  items: [],
  loading: false,
};

export const restoreCart = createAsyncThunk('cart/restoreCart', async () => {
  return await getCart();
});

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (product: Product, { getState }) => {
    const state = getState() as {
      cart: CartState;
    };

    const existingItem = state.cart.items.find(
      item => item.product.id === product.id,
    );

    let updatedItems: CartItem[];

    if (existingItem) {
      updatedItems = state.cart.items.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      );
    } else {
      updatedItems = [
        ...state.cart.items,
        {
          product,
          quantity: 1,
        },
      ];
    }

    await saveCart(updatedItems);

    return updatedItems;
  },
);

export const increaseQuantity = createAsyncThunk(
  'cart/increaseQuantity',
  async (productId: number, { getState }) => {
    const state = getState() as {
      cart: CartState;
    };

    const updatedItems = state.cart.items.map(item =>
      item.product.id === productId
        ? { ...item, quantity: item.quantity + 1 }
        : item,
    );

    await saveCart(updatedItems);

    return updatedItems;
  },
);

export const decreaseQuantity = createAsyncThunk(
  'cart/decreaseQuantity',
  async (productId: number, { getState }) => {
    const state = getState() as {
      cart: CartState;
    };

    const updatedItems = state.cart.items
      .map(item =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      )
      .filter(item => item.quantity > 0);

    await saveCart(updatedItems);

    return updatedItems;
  },
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId: number, { getState }) => {
    const state = getState() as {
      cart: CartState;
    };

    const updatedItems = state.cart.items.filter(
      item => item.product.id !== productId,
    );

    await saveCart(updatedItems);

    return updatedItems;
  },
);

export const clearCart = createAsyncThunk('cart/clearCart', async () => {
  await clearCartStorage();
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},

  extraReducers: builder => {
    builder
      .addCase(restoreCart.pending, state => {
        state.loading = true;
      })
      .addCase(restoreCart.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(restoreCart.rejected, state => {
        state.loading = false;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(increaseQuantity.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(decreaseQuantity.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(clearCart.fulfilled, state => {
        state.items = [];
      });
  },
});

export default cartSlice.reducer;
