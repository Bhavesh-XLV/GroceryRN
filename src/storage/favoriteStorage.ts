import AsyncStorage from '@react-native-async-storage/async-storage';

import { Product } from '../types';

const FAVORITES_KEY = '@grocery/favorites';

export async function saveFavorites(favorites: Product[]): Promise<void> {
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export async function getFavorites(): Promise<Product[]> {
  const storedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);

  if (!storedFavorites) {
    return [];
  }

  try {
    return JSON.parse(storedFavorites) as Product[];
  } catch {
    return [];
  }
}

export async function clearFavorites(): Promise<void> {
  await AsyncStorage.removeItem(FAVORITES_KEY);
}
