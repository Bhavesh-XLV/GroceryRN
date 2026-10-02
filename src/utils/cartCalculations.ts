import { CartItem } from '../store/cartSlice';

const TAX_RATE_PERCENT = 5;
const SAVE10_DISCOUNT_PERCENT = 10;

export interface CartSummary {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

function toCents(amount: number): number {
  return Math.round(amount * 100);
}

function fromCents(amount: number): number {
  return amount / 100;
}

export function calculateCartSummary(
  items: CartItem[],
  couponCode?: string,
): CartSummary {
  const subtotalCents = items.reduce(
    (total, item) => total + toCents(item.product.price) * item.quantity,
    0,
  );

  const discountCents =
    couponCode === 'SAVE10'
      ? Math.round((subtotalCents * SAVE10_DISCOUNT_PERCENT) / 100)
      : 0;

  const taxableCents = subtotalCents - discountCents;

  const taxCents = Math.round((taxableCents * TAX_RATE_PERCENT) / 100);

  const totalCents = taxableCents + taxCents;

  return {
    subtotal: fromCents(subtotalCents),
    discount: fromCents(discountCents),
    tax: fromCents(taxCents),
    total: fromCents(totalCents),
  };
}
