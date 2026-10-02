import { CartItem } from '../store/cartSlice';

export type OrderStatus = 'processing' | 'completed';

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
}
