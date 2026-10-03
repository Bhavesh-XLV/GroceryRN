import { configureStore } from '@reduxjs/toolkit';

import favoriteReducer, {
  clearFavorites,
  removeFavorite,
  restoreFavorites,
  toggleFavorite,
} from '../src/store/favoriteSlice';

import {
  clearFavorites as clearStoredFavorites,
  getFavorites,
  saveFavorites,
} from '../src/storage/favoriteStorage';

import { Product } from '../src/types';

jest.mock('../src/storage/favoriteStorage', () => ({
  getFavorites: jest.fn(),
  saveFavorites: jest.fn(),
  clearFavorites: jest.fn(),
}));

const mockProduct: Product = {
  id: 1,
  title: 'Apple',
  description: 'Fresh apple',
  category: 'groceries',
  price: 10,
  discountPercentage: 0,
  rating: 4.5,
  stock: 20,
  thumbnail: 'https://example.com/apple.jpg',
  images: [],
};

const secondProduct: Product = {
  ...mockProduct,
  id: 2,
  title: 'Banana',
  price: 5,
};

const createTestStore = (preloadedItems: Product[] = []) => {
  return configureStore({
    reducer: {
      favorites: favoriteReducer,
    },
    preloadedState: {
      favorites: {
        items: preloadedItems,
        loading: false,
      },
    },
  });
};

describe('favoriteSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (saveFavorites as jest.Mock).mockResolvedValue(undefined);
    (clearStoredFavorites as jest.Mock).mockResolvedValue(undefined);
  });

  describe('toggleFavorite', () => {
    it('adds a product when it is not already a favorite', async () => {
      const store = createTestStore();

      await store.dispatch(toggleFavorite(mockProduct));

      expect(store.getState().favorites.items).toEqual([mockProduct]);

      expect(saveFavorites).toHaveBeenCalledWith([mockProduct]);
    });

    it('removes a product when it is already a favorite', async () => {
      const store = createTestStore([mockProduct]);

      await store.dispatch(toggleFavorite(mockProduct));

      expect(store.getState().favorites.items).toEqual([]);

      expect(saveFavorites).toHaveBeenCalledWith([]);
    });

    it('keeps other favorites unchanged', async () => {
      const store = createTestStore([mockProduct, secondProduct]);

      await store.dispatch(toggleFavorite(mockProduct));

      expect(store.getState().favorites.items).toEqual([secondProduct]);
    });
  });

  describe('removeFavorite', () => {
    it('removes the selected product', async () => {
      const store = createTestStore([mockProduct, secondProduct]);

      await store.dispatch(removeFavorite(mockProduct.id));

      expect(store.getState().favorites.items).toEqual([secondProduct]);

      expect(saveFavorites).toHaveBeenCalledWith([secondProduct]);
    });

    it('does nothing when product does not exist', async () => {
      const store = createTestStore([mockProduct]);

      await store.dispatch(removeFavorite(999));

      expect(store.getState().favorites.items).toEqual([mockProduct]);

      expect(saveFavorites).toHaveBeenCalledWith([mockProduct]);
    });
  });

  describe('clearFavorites', () => {
    it('clears all favorites', async () => {
      const store = createTestStore([mockProduct, secondProduct]);

      await store.dispatch(clearFavorites());

      expect(store.getState().favorites.items).toEqual([]);

      expect(clearStoredFavorites).toHaveBeenCalledTimes(1);
    });
  });

  describe('restoreFavorites', () => {
    it('restores saved favorites', async () => {
      const savedFavorites = [mockProduct, secondProduct];

      (getFavorites as jest.Mock).mockResolvedValue(savedFavorites);

      const store = createTestStore();

      expect(store.getState().favorites.loading).toBe(false);

      const promise = store.dispatch(restoreFavorites());

      expect(store.getState().favorites.loading).toBe(true);

      await promise;

      expect(store.getState().favorites.items).toEqual(savedFavorites);

      expect(store.getState().favorites.loading).toBe(false);
    });

    it('handles restore failure', async () => {
      (getFavorites as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const store = createTestStore();

      await store.dispatch(restoreFavorites());

      expect(store.getState().favorites.items).toEqual([]);

      expect(store.getState().favorites.loading).toBe(false);
    });
  });
});
