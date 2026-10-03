import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import FavoritesScreen from '../src/screens/favorites/FavoritesScreen';
import { useAppTheme } from '../src/hooks/useAppTheme';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('../src/hooks/useAppTheme', () => ({
  useAppTheme: jest.fn(),
}));

jest.mock('../src/store/favoriteSlice', () => ({
  removeFavorite: jest.fn((id: number) => ({
    type: 'favorites/removeFavorite',
    payload: id,
  })),
}));

const mockedUseDispatch = useDispatch as unknown as jest.Mock;
const mockedUseSelector = useSelector as unknown as jest.Mock;
const mockedUseNavigation = useNavigation as jest.Mock;
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

const favoriteProduct = {
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

describe('FavoritesScreen', () => {
  const dispatchMock = jest.fn();
  const navigateMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseDispatch.mockReturnValue(dispatchMock);
    mockedUseNavigation.mockReturnValue({
      navigate: navigateMock,
    });

    mockedUseAppTheme.mockReturnValue({
      mode: 'light',
      colors,
    });

    mockedUseSelector.mockImplementation((selector: Function) =>
      selector({
        favorites: {
          items: [favoriteProduct],
        },
      }),
    );
  });

  it('shows empty state when there are no favorites', async () => {
    mockedUseSelector.mockImplementation((selector: Function) =>
      selector({
        favorites: {
          items: [],
        },
      }),
    );

    const { getByText } = await render(<FavoritesScreen />);

    expect(getByText('No Favorites Yet')).toBeTruthy();

    expect(getByText('Products you favorite will appear here.')).toBeTruthy();
  });

  it('renders favorite product', async () => {
    const { getByText } = await render(<FavoritesScreen />);

    expect(getByText('Test Product')).toBeTruthy();
    expect(getByText('$10')).toBeTruthy();
    expect(getByText('⭐ 4.5')).toBeTruthy();
  });

  it('dispatches removeFavorite when favorite button is pressed', async () => {
    const { getByText } = await render(<FavoritesScreen />);

    fireEvent.press(getByText('♥'));

    expect(dispatchMock).toHaveBeenCalledTimes(1);
  });

  it('navigates to product detail when product is pressed', async () => {
    const { getByText } = await render(<FavoritesScreen />);

    fireEvent.press(getByText('Test Product'));

    expect(navigateMock).toHaveBeenCalledWith('ProductDetail', {
      productId: 1,
    });
  });
});
