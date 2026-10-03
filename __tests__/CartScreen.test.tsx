import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { useDispatch, useSelector } from 'react-redux';

import CartScreen from '../src/screens/cart/CartScreen';
import { useAppTheme } from '../src/hooks/useAppTheme';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('../src/hooks/useAppTheme', () => ({
  useAppTheme: jest.fn(),
}));

jest.mock('../src/store/cartSlice', () => ({
  clearCart: jest.fn(() => ({
    type: 'cart/clearCart',
  })),
  decreaseQuantity: jest.fn((id: number) => ({
    type: 'cart/decreaseQuantity',
    payload: id,
  })),
  increaseQuantity: jest.fn((id: number) => ({
    type: 'cart/increaseQuantity',
    payload: id,
  })),
  removeFromCart: jest.fn((id: number) => ({
    type: 'cart/removeFromCart',
    payload: id,
  })),
}));

jest.mock('../src/store/orderSlice', () => ({
  createOrder: jest.fn((order: unknown) => ({
    unwrap: jest.fn().mockResolvedValue(order),
  })),
}));

const mockedUseDispatch = useDispatch as unknown as jest.Mock;
const mockedUseSelector = useSelector as unknown as jest.Mock;
const mockedUseAppTheme = useAppTheme as jest.Mock;

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

const cartItem = {
  product,
  quantity: 2,
};

describe('CartScreen', () => {
  const dispatchMock = jest.fn(() => ({
    unwrap: jest.fn().mockResolvedValue({}),
  }));

  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseDispatch.mockReturnValue(dispatchMock);

    mockedUseAppTheme.mockReturnValue({
      mode: 'light',
      colors,
    });

    mockedUseSelector.mockImplementation((selector: Function) =>
      selector({
        cart: {
          items: [cartItem],
        },
      }),
    );
  });

  it('shows empty cart state when cart has no items', async () => {
    mockedUseSelector.mockImplementation((selector: Function) =>
      selector({
        cart: {
          items: [],
        },
      }),
    );

    const { getByText } = await render(<CartScreen />);

    expect(getByText('Your Cart is Empty')).toBeTruthy();
    expect(getByText('Add some products to your cart.')).toBeTruthy();
  });

  it('renders cart item and summary', async () => {
    const { getByText } = await render(<CartScreen />);

    expect(getByText('Test Product')).toBeTruthy();
    expect(getByText('$10')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();

    expect(getByText('Subtotal')).toBeTruthy();
    expect(getByText('$20.00')).toBeTruthy();

    expect(getByText('Tax')).toBeTruthy();
    expect(getByText('$1.00')).toBeTruthy();

    expect(getByText('Total')).toBeTruthy();
    expect(getByText('$21.00')).toBeTruthy();
  });

  it('dispatches decrease quantity', async () => {
    const { getByText } = await render(<CartScreen />);

    fireEvent.press(getByText('−'));

    expect(dispatchMock).toHaveBeenCalledTimes(1);
  });

  it('dispatches increase quantity', async () => {
    const { getByText } = await render(<CartScreen />);

    fireEvent.press(getByText('+'));

    expect(dispatchMock).toHaveBeenCalledTimes(1);
  });

  it('dispatches remove item', async () => {
    const { getByText } = await render(<CartScreen />);

    fireEvent.press(getByText('Remove'));

    expect(dispatchMock).toHaveBeenCalledTimes(1);
  });

  it('applies SAVE10 coupon and updates discount', async () => {
    const { getByPlaceholderText, getByText } = await render(<CartScreen />);

    const couponInput = getByPlaceholderText('Enter coupon code');

    await fireEvent.changeText(couponInput, 'SAVE10');

    await fireEvent.press(getByText('Apply'));

    expect(getByText('-$2.00')).toBeTruthy();

    expect(getByText('$18.90')).toBeTruthy();
  });

  it('does not apply invalid coupon', async () => {
    const { getByPlaceholderText, getByText, queryByText } = await render(
      <CartScreen />,
    );

    const couponInput = getByPlaceholderText('Enter coupon code');

    await fireEvent.changeText(couponInput, 'INVALID');

    await fireEvent.press(getByText('Apply'));

    expect(queryByText('-$2.00')).toBeNull();

    expect(getByText('$21.00')).toBeTruthy();
  });

  it('places order and clears cart', async () => {
    const { getByText } = await render(<CartScreen />);

    await fireEvent.press(getByText('Place Order'));

    expect(dispatchMock).toHaveBeenCalledTimes(2);
  });
});
