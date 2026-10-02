import AsyncStorage from '@react-native-async-storage/async-storage';

import { CartItem } from '../store/cartSlice';

const CART_KEY = '@grocery/cart';

export async function saveCart(items: CartItem[]): Promise<void> {
  await AsyncStorage.setItem(CART_KEY, JSON.stringify(items));
}

export async function getCart(): Promise<CartItem[]> {
  const storedCart = await AsyncStorage.getItem(CART_KEY);

  if (!storedCart) {
    return [];
  }

  try {
    return JSON.parse(storedCart) as CartItem[];
  } catch {
    return [];
  }
}

export async function clearCartStorage(): Promise<void> {
  await AsyncStorage.removeItem(CART_KEY);
}
