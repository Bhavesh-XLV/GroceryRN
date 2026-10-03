import React from 'react';
import { render } from '@testing-library/react-native';
import { useSelector } from 'react-redux';

import OrdersScreen from '../src/screens/orders/OrdersScreen';
import { useAppTheme } from '../src/hooks/useAppTheme';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('../src/hooks/useAppTheme', () => ({
  useAppTheme: jest.fn(),
}));

jest.mock('../src/utils/orderStatus', () => ({
  getOrderStatus: jest.fn(() => 'processing'),
}));

const mockedUseSelector = useSelector as unknown as jest.Mock;
const mockedUseAppTheme = useAppTheme as unknown as jest.Mock;

const colors = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#111111',
  secondaryText: '#666666',
  border: '#DDDDDD',
  primary: '#007AFF',
  card: '#FFFFFF',
  danger: '#D32F2F',
};

const product = {
  id: 1,
  title: 'Test Product',
  description: 'Test product description',
  category: 'groceries',
  price: 10,
  discountPercentage: 5,
  rating: 4.5,
  stock: 10,
  thumbnail: 'https://example.com/product.jpg',
  images: ['https://example.com/product.jpg'],
};

const order = {
  id: 'ORD-123',
  date: '2026-10-03T10:00:00.000Z',
  items: [
    {
      product,
      quantity: 2,
    },
  ],
  subtotal: 20,
  discountPercentage: 10,
  discount: 2,
  tax: 0.9,
  total: 18.9,
  status: 'processing' as const,
};

describe('OrdersScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseAppTheme.mockReturnValue({
      mode: 'light',
      colors,
    });

    mockedUseSelector.mockImplementation((selector: Function) =>
      selector({
        orders: {
          items: [order],
        },
      }),
    );
  });

  it('shows empty state when there are no orders', async () => {
    mockedUseSelector.mockImplementation((selector: Function) =>
      selector({
        orders: {
          items: [],
        },
      }),
    );

    const { getByText } = await render(<OrdersScreen />);

    expect(getByText('No Orders Yet')).toBeTruthy();

    expect(getByText('Your placed orders will appear here.')).toBeTruthy();
  });

  it('renders order details', async () => {
    const { getByText } = await render(<OrdersScreen />);

    expect(getByText('ORD-123')).toBeTruthy();
    expect(getByText('PROCESSING')).toBeTruthy();
    expect(getByText('Test Product')).toBeTruthy();
    expect(getByText('$10.00 × 2')).toBeTruthy();
  });

  it('renders order summary correctly', async () => {
    const { getByText } = await render(<OrdersScreen />);

    expect(getByText('$20.00')).toBeTruthy();
    expect(getByText('Discount (10%)')).toBeTruthy();
    expect(getByText('-$2.00')).toBeTruthy();
    expect(getByText('$0.90')).toBeTruthy();
    expect(getByText('$18.90')).toBeTruthy();
  });

  it('renders multiple orders', async () => {
    const secondOrder = {
      ...order,
      id: 'ORD-456',
      discount: 0,
      discountPercentage: 0,
      total: 21,
    };

    mockedUseSelector.mockImplementation((selector: Function) =>
      selector({
        orders: {
          items: [order, secondOrder],
        },
      }),
    );

    const { getByText } = await render(<OrdersScreen />);

    expect(getByText('ORD-123')).toBeTruthy();
    expect(getByText('ORD-456')).toBeTruthy();
  });
});
