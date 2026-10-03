import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  clearOrders,
  getOrders,
  saveOrders,
} from '../src/storage/orderStorage';

import { Order } from '../src/types';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
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

describe('orderStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(null);
  });

  describe('saveOrders', () => {
    it('saves orders to AsyncStorage', async () => {
      const orders = [mockOrder, secondOrder];

      await saveOrders(orders);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@grocery/orders',
        JSON.stringify(orders),
      );
    });
  });

  describe('getOrders', () => {
    it('returns stored orders', async () => {
      const orders = [mockOrder, secondOrder];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(orders),
      );

      const result = await getOrders();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@grocery/orders');

      expect(result).toEqual(orders);
    });

    it('returns an empty array when no orders are stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await getOrders();

      expect(result).toEqual([]);
    });

    it('returns an empty array when stored data is invalid JSON', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid-json');

      const result = await getOrders();

      expect(result).toEqual([]);
    });
  });

  describe('clearOrders', () => {
    it('removes stored orders', async () => {
      await clearOrders();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@grocery/orders');
    });
  });
});
