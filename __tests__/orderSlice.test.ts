import { configureStore } from '@reduxjs/toolkit';

import orderReducer, {
  createOrder,
  restoreOrders,
} from '../src/store/orderSlice';

import { getOrders, saveOrders } from '../src/storage/orderStorage';

import { Order } from '../src/types';

jest.mock('../src/storage/orderStorage', () => ({
  getOrders: jest.fn(),
  saveOrders: jest.fn(),
}));

const mockOrder: Order = {
  id: 'order-1',
  date: '2026-10-03T10:00:00.000Z',
  items: [],
  subtotal: 100,
  discountPercentage: 10,
  discount: 10,
  tax: 4.5,
  total: 94.5,
  status: 'processing',
};

const secondOrder: Order = {
  ...mockOrder,
  id: 'order-2',
  total: 50,
};

const createTestStore = (preloadedItems: Order[] = []) => {
  return configureStore({
    reducer: {
      orders: orderReducer,
    },
    preloadedState: {
      orders: {
        items: preloadedItems,
        loading: false,
      },
    },
  });
};

describe('orderSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (saveOrders as jest.Mock).mockResolvedValue(undefined);
  });

  describe('createOrder', () => {
    it('creates a new order and adds it to the beginning', async () => {
      const store = createTestStore([secondOrder]);

      await store.dispatch(createOrder(mockOrder));

      expect(store.getState().orders.items).toEqual([mockOrder, secondOrder]);

      expect(saveOrders).toHaveBeenCalledWith([mockOrder, secondOrder]);
    });

    it('creates the first order when the list is empty', async () => {
      const store = createTestStore();

      await store.dispatch(createOrder(mockOrder));

      expect(store.getState().orders.items).toEqual([mockOrder]);

      expect(saveOrders).toHaveBeenCalledWith([mockOrder]);
    });

    it('keeps existing orders unchanged', async () => {
      const store = createTestStore([secondOrder]);

      await store.dispatch(createOrder(mockOrder));

      expect(store.getState().orders.items[1]).toEqual(secondOrder);
    });
  });

  describe('restoreOrders', () => {
    it('restores saved orders', async () => {
      const savedOrders = [mockOrder, secondOrder];

      (getOrders as jest.Mock).mockResolvedValue(savedOrders);

      const store = createTestStore();

      expect(store.getState().orders.loading).toBe(false);

      const promise = store.dispatch(restoreOrders());

      expect(store.getState().orders.loading).toBe(true);

      await promise;

      expect(store.getState().orders.items).toEqual(savedOrders);

      expect(store.getState().orders.loading).toBe(false);
    });

    it('handles restore failure', async () => {
      (getOrders as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const store = createTestStore();

      await store.dispatch(restoreOrders());

      expect(store.getState().orders.items).toEqual([]);

      expect(store.getState().orders.loading).toBe(false);
    });
  });
});
