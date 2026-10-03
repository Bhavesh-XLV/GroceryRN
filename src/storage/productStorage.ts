import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../types';

const PRODUCTS_CACHE_KEY = '@grocery/products_cache';

interface ProductCache {
  products: Product[];
  savedAt: string;
}

export async function saveProductsCache(products: Product[]): Promise<void> {
  const cache: ProductCache = {
    products,
    savedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(cache));
}

export async function mergeProductsCache(
  newProducts: Product[],
): Promise<void> {
  const existingCache = await getProductsCache();

  const existingProducts = existingCache ? existingCache.products : [];

  const productMap = new Map<number, Product>();

  existingProducts.forEach(product => {
    productMap.set(product.id, product);
  });

  newProducts.forEach(product => {
    productMap.set(product.id, product);
  });

  await saveProductsCache(Array.from(productMap.values()));
}

export async function getProductsCache(): Promise<ProductCache | null> {
  const cachedData = await AsyncStorage.getItem(PRODUCTS_CACHE_KEY);

  if (!cachedData) {
    return null;
  }

  try {
    return JSON.parse(cachedData) as ProductCache;
  } catch {
    return null;
  }
}

export async function clearProductsCache(): Promise<void> {
  await AsyncStorage.removeItem(PRODUCTS_CACHE_KEY);
}

export async function getCachedProduct(
  productId: number,
): Promise<Product | null> {
  const cache = await getProductsCache();

  if (!cache) {
    return null;
  }

  const product = cache.products.find(item => item.id === productId);

  return product || null;
}
