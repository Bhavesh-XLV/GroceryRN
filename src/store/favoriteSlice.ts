import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Product } from '../types';
import {
  clearFavorites as clearStoredFavorites,
  getFavorites,
  saveFavorites,
} from '../storage/favoriteStorage';

interface FavoriteState {
  items: Product[];
  loading: boolean;
}

const initialState: FavoriteState = {
  items: [],
  loading: false,
};

export const restoreFavorites = createAsyncThunk(
  'favorites/restoreFavorites',
  async () => {
    return await getFavorites();
  },
);

export const toggleFavorite = createAsyncThunk(
  'favorites/toggleFavorite',
  async (product: Product, { getState }) => {
    const state = getState() as {
      favorites: FavoriteState;
    };

    const exists = state.favorites.items.some(item => item.id === product.id);

    let updatedFavorites: Product[];

    if (exists) {
      updatedFavorites = state.favorites.items.filter(
        item => item.id !== product.id,
      );
    } else {
      updatedFavorites = [...state.favorites.items, product];
    }

    await saveFavorites(updatedFavorites);

    return updatedFavorites;
  },
);

export const removeFavorite = createAsyncThunk(
  'favorites/removeFavorite',
  async (productId: number, { getState }) => {
    const state = getState() as {
      favorites: FavoriteState;
    };

    const updatedFavorites = state.favorites.items.filter(
      item => item.id !== productId,
    );

    await saveFavorites(updatedFavorites);

    return updatedFavorites;
  },
);

export const clearFavorites = createAsyncThunk(
  'favorites/clearFavorites',
  async () => {
    await clearStoredFavorites();
  },
);

const favoriteSlice = createSlice({
  name: 'favorites',
  initialState,

  reducers: {},

  extraReducers: builder => {
    builder
      .addCase(restoreFavorites.pending, state => {
        state.loading = true;
      })
      .addCase(restoreFavorites.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(restoreFavorites.rejected, state => {
        state.loading = false;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(clearFavorites.fulfilled, state => {
        state.items = [];
      });
  },
});

export default favoriteSlice.reducer;
