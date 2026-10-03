import { calculateCartSummary } from '../src/utils/cartCalculations';

describe('calculateCartSummary', () => {
  const product = {
    id: 1,
    title: 'Test Product',
    description: 'Test product',
    category: 'groceries',
    price: 10,
    discountPercentage: 0,
    rating: 4.5,
    stock: 10,
    thumbnail: '',
    images: [],
  };

  it('calculates subtotal correctly', () => {
    const result = calculateCartSummary([
      {
        product,
        quantity: 2,
      },
    ]);

    expect(result.subtotal).toBe(20);
  });

  it('calculates tax correctly', () => {
    const result = calculateCartSummary([
      {
        product,
        quantity: 2,
      },
    ]);

    expect(result.tax).toBe(1);
  });

  it('calculates total correctly', () => {
    const result = calculateCartSummary([
      {
        product,
        quantity: 2,
      },
    ]);

    expect(result.total).toBe(21);
  });

  it('applies SAVE10 coupon correctly', () => {
    const result = calculateCartSummary(
      [
        {
          product,
          quantity: 2,
        },
      ],
      'SAVE10',
    );

    expect(result.discount).toBe(2);
    expect(result.tax).toBe(0.9);
    expect(result.total).toBe(18.9);
  });

  it('does not apply an invalid coupon', () => {
    const result = calculateCartSummary(
      [
        {
          product,
          quantity: 2,
        },
      ],
      'INVALID',
    );

    expect(result.discount).toBe(0);
    expect(result.total).toBe(21);
  });

  it('returns zero totals for an empty cart', () => {
    const result = calculateCartSummary([]);

    expect(result.subtotal).toBe(0);
    expect(result.discount).toBe(0);
    expect(result.tax).toBe(0);
    expect(result.total).toBe(0);
  });
});
