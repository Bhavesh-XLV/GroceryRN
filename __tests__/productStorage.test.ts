import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  clearProductsCache,
  getCachedProduct,
  getProductsCache,
  mergeProductsCache,
  saveProductsCache,
} from '../src/storage/productStorage';

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
  discountPercentage: 5,
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

describe('productStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(null);
  });

  describe('saveProductsCache', () => {
    it('saves products with a timestamp', async () => {
      await saveProductsCache([mockProduct]);

      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);

      const [key, value] = (AsyncStorage.setItem as jest.Mock).mock.calls[0];

      expect(key).toBe('@grocery/products_cache');

      const parsedValue = JSON.parse(value);

      expect(parsedValue.products).toEqual([mockProduct]);
      expect(parsedValue.savedAt).toEqual(expect.any(String));
    });
  });

  describe('getProductsCache', () => {
    it('returns cached products', async () => {
      const cachedData = {
        products: [mockProduct],
        savedAt: '2026-10-03T10:00:00.000Z',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(cachedData),
      );

      const result = await getProductsCache();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith(
        '@grocery/products_cache',
      );

      expect(result).toEqual(cachedData);
    });

    it('returns null when cache does not exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await getProductsCache();

      expect(result).toBeNull();
    });

    it('returns null when cached data is invalid JSON', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid-json');

      const result = await getProductsCache();

      expect(result).toBeNull();
    });
  });

  describe('mergeProductsCache', () => {
    it('merges new products with existing cache', async () => {
      const existingCache = {
        products: [mockProduct],
        savedAt: '2026-10-03T10:00:00.000Z',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(existingCache),
      );

      await mergeProductsCache([secondProduct]);

      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);

      const [, value] = (AsyncStorage.setItem as jest.Mock).mock.calls[0];

      const savedCache = JSON.parse(value);

      expect(savedCache.products).toEqual([mockProduct, secondProduct]);

      expect(savedCache.savedAt).toEqual(expect.any(String));
    });

    it('replaces an existing product with the same id', async () => {
      const updatedProduct: Product = {
        ...mockProduct,
        price: 15,
      };

      const existingCache = {
        products: [mockProduct],
        savedAt: '2026-10-03T10:00:00.000Z',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(existingCache),
      );

      await mergeProductsCache([updatedProduct]);

      const [, value] = (AsyncStorage.setItem as jest.Mock).mock.calls[0];

      const savedCache = JSON.parse(value);

      expect(savedCache.products).toEqual([updatedProduct]);
    });

    it('creates a new cache when no existing cache exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      await mergeProductsCache([mockProduct]);

      const [, value] = (AsyncStorage.setItem as jest.Mock).mock.calls[0];

      const savedCache = JSON.parse(value);

      expect(savedCache.products).toEqual([mockProduct]);
    });
  });

  describe('clearProductsCache', () => {
    it('removes the product cache', async () => {
      await clearProductsCache();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        '@grocery/products_cache',
      );
    });
  });

  describe('getCachedProduct', () => {
    it('returns a product by id', async () => {
      const cachedData = {
        products: [mockProduct, secondProduct],
        savedAt: '2026-10-03T10:00:00.000Z',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(cachedData),
      );

      const result = await getCachedProduct(2);

      expect(result).toEqual(secondProduct);
    });

    it('returns null when product does not exist', async () => {
      const cachedData = {
        products: [mockProduct],
        savedAt: '2026-10-03T10:00:00.000Z',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(cachedData),
      );

      const result = await getCachedProduct(999);

      expect(result).toBeNull();
    });

    it('returns null when cache does not exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await getCachedProduct(1);

      expect(result).toBeNull();
    });
  });
});
