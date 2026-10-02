import AsyncStorage from '@react-native-async-storage/async-storage';

import { Order } from '../types';

const ORDERS_KEY = '@grocery/orders';

export async function saveOrders(orders: Order[]): Promise<void> {
  await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export async function getOrders(): Promise<Order[]> {
  const storedOrders = await AsyncStorage.getItem(ORDERS_KEY);

  if (!storedOrders) {
    return [];
  }

  try {
    return JSON.parse(storedOrders) as Order[];
  } catch {
    return [];
  }
}

export async function clearOrders(): Promise<void> {
  await AsyncStorage.removeItem(ORDERS_KEY);
}
