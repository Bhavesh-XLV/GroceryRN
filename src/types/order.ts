import { CartItem } from '../store/cartSlice';

export type OrderStatus = 'processing' | 'completed';

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discountPercentage: number;
  discount: number;
  tax: number;
  total: number;
  status: OrderStatus;
}
