import { OrderStatus } from '../types';

const COMPLETION_TIME_MS = 30 * 60 * 1000;

export function getOrderStatus(orderDate: string): OrderStatus {
  const createdAt = new Date(orderDate).getTime();
  const now = Date.now();

  if (now - createdAt >= COMPLETION_TIME_MS) {
    return 'completed';
  }

  return 'processing';
}
