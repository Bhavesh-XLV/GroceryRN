import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  clearCartStorage,
  getCart,
  saveCart,
} from '../src/storage/cartStorage';

import { CartItem } from '../src/store/cartSlice';
import { Product } from '../src/types';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
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

const mockCartItem: CartItem = {
  product: mockProduct,
  quantity: 2,
};

describe('cartStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(null);
  });

  describe('saveCart', () => {
    it('saves cart items to AsyncStorage', async () => {
      const items = [mockCartItem];

      await saveCart(items);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@grocery/cart',
        JSON.stringify(items),
      );
    });
  });

  describe('getCart', () => {
    it('returns stored cart items', async () => {
      const items = [mockCartItem];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(items),
      );

      const result = await getCart();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@grocery/cart');

      expect(result).toEqual(items);
    });

    it('returns an empty array when no cart is stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await getCart();

      expect(result).toEqual([]);
    });

    it('returns an empty array when stored cart data is invalid JSON', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid-json');

      const result = await getCart();

      expect(result).toEqual([]);
    });
  });

  describe('clearCartStorage', () => {
    it('removes the stored cart', async () => {
      await clearCartStorage();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@grocery/cart');
    });
  });
});
