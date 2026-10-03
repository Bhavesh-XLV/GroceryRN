import { configureStore } from '@reduxjs/toolkit';

import cartReducer, {
  addToCart,
  clearCart,
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
  restoreCart,
} from '../src/store/cartSlice';

import {
  clearCartStorage,
  getCart,
  saveCart,
} from '../src/storage/cartStorage';

import { Product } from '../src/types';

jest.mock('../src/storage/cartStorage', () => ({
  getCart: jest.fn(),
  saveCart: jest.fn(),
  clearCartStorage: jest.fn(),
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

const createTestStore = (preloadedItems = []) => {
  return configureStore({
    reducer: {
      cart: cartReducer,
    },
    preloadedState: {
      cart: {
        items: preloadedItems,
        loading: false,
      },
    },
  });
};

describe('cartSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (saveCart as jest.Mock).mockResolvedValue(undefined);
    (clearCartStorage as jest.Mock).mockResolvedValue(undefined);
  });

  describe('addToCart', () => {
    it('adds a new product with quantity 1', async () => {
      const store = createTestStore();

      await store.dispatch(addToCart(mockProduct));

      expect(store.getState().cart.items).toEqual([
        {
          product: mockProduct,
          quantity: 1,
        },
      ]);

      expect(saveCart).toHaveBeenCalledWith([
        {
          product: mockProduct,
          quantity: 1,
        },
      ]);
    });

    it('increases quantity when product already exists', async () => {
      const store = createTestStore([
        {
          product: mockProduct,
          quantity: 1,
        },
      ]);

      await store.dispatch(addToCart(mockProduct));

      expect(store.getState().cart.items[0].quantity).toBe(2);
    });

    it('does not modify other cart items', async () => {
      const store = createTestStore([
        {
          product: mockProduct,
          quantity: 1,
        },
        {
          product: secondProduct,
          quantity: 2,
        },
      ]);

      await store.dispatch(addToCart(mockProduct));

      expect(store.getState().cart.items).toEqual([
        {
          product: mockProduct,
          quantity: 2,
        },
        {
          product: secondProduct,
          quantity: 2,
        },
      ]);
    });
  });

  describe('increaseQuantity', () => {
    it('increases the selected product quantity', async () => {
      const store = createTestStore([
        {
          product: mockProduct,
          quantity: 2,
        },
      ]);

      await store.dispatch(increaseQuantity(mockProduct.id));

      expect(store.getState().cart.items[0].quantity).toBe(3);
      expect(saveCart).toHaveBeenCalled();
    });
  });

  describe('decreaseQuantity', () => {
    it('decreases the selected product quantity', async () => {
      const store = createTestStore([
        {
          product: mockProduct,
          quantity: 2,
        },
      ]);

      await store.dispatch(decreaseQuantity(mockProduct.id));

      expect(store.getState().cart.items[0].quantity).toBe(1);
    });

    it('removes the product when quantity reaches zero', async () => {
      const store = createTestStore([
        {
          product: mockProduct,
          quantity: 1,
        },
      ]);

      await store.dispatch(decreaseQuantity(mockProduct.id));

      expect(store.getState().cart.items).toEqual([]);
    });

    it('keeps other products unchanged', async () => {
      const store = createTestStore([
        {
          product: mockProduct,
          quantity: 1,
        },
        {
          product: secondProduct,
          quantity: 2,
        },
      ]);

      await store.dispatch(decreaseQuantity(mockProduct.id));

      expect(store.getState().cart.items).toEqual([
        {
          product: secondProduct,
          quantity: 2,
        },
      ]);
    });
  });

  describe('removeFromCart', () => {
    it('removes the selected product', async () => {
      const store = createTestStore([
        {
          product: mockProduct,
          quantity: 2,
        },
        {
          product: secondProduct,
          quantity: 1,
        },
      ]);

      await store.dispatch(removeFromCart(mockProduct.id));

      expect(store.getState().cart.items).toEqual([
        {
          product: secondProduct,
          quantity: 1,
        },
      ]);

      expect(saveCart).toHaveBeenCalledWith([
        {
          product: secondProduct,
          quantity: 1,
        },
      ]);
    });
  });

  describe('clearCart', () => {
    it('clears all cart items', async () => {
      const store = createTestStore([
        {
          product: mockProduct,
          quantity: 2,
        },
      ]);

      await store.dispatch(clearCart());

      expect(store.getState().cart.items).toEqual([]);
      expect(clearCartStorage).toHaveBeenCalledTimes(1);
    });
  });

  describe('restoreCart', () => {
    it('restores saved cart items', async () => {
      const savedItems = [
        {
          product: mockProduct,
          quantity: 3,
        },
      ];

      (getCart as jest.Mock).mockResolvedValue(savedItems);

      const store = createTestStore();

      expect(store.getState().cart.loading).toBe(false);

      const promise = store.dispatch(restoreCart());

      expect(store.getState().cart.loading).toBe(true);

      await promise;

      expect(store.getState().cart.items).toEqual(savedItems);
      expect(store.getState().cart.loading).toBe(false);
    });

    it('handles restore failure', async () => {
      (getCart as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const store = createTestStore();

      await store.dispatch(restoreCart());

      expect(store.getState().cart.loading).toBe(false);
      expect(store.getState().cart.items).toEqual([]);
    });
  });
});
