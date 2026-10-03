import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import ProductDetailScreen from '../src/screens/products/ProductDetailScreen';
import { useGetProductByIdQuery } from '../src/api/apiSlice';
import { useAppTheme } from '../src/hooks/useAppTheme';
import useNetworkStatus from '../src/hooks/useNetworkStatus';
import { getCachedProduct } from '../src/storage/productStorage';
import { useDispatch, useSelector } from 'react-redux';

jest.mock('../src/api/apiSlice', () => ({
  useGetProductByIdQuery: jest.fn(),
}));

jest.mock('../src/hooks/useAppTheme', () => ({
  useAppTheme: jest.fn(),
}));

jest.mock('../src/hooks/useNetworkStatus', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../src/storage/productStorage', () => ({
  getCachedProduct: jest.fn(),
}));

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('../src/store/cartSlice', () => ({
  addToCart: jest.fn((product: unknown) => ({
    type: 'cart/addToCart',
    payload: product,
  })),
  increaseQuantity: jest.fn((id: number) => ({
    type: 'cart/increaseQuantity',
    payload: id,
  })),
  decreaseQuantity: jest.fn((id: number) => ({
    type: 'cart/decreaseQuantity',
    payload: id,
  })),
}));

jest.mock('../src/store/favoriteSlice', () => ({
  toggleFavorite: jest.fn((product: unknown) => ({
    type: 'favorites/toggleFavorite',
    payload: product,
  })),
}));

const mockedUseGetProductByIdQuery = useGetProductByIdQuery as jest.Mock;

const mockedUseAppTheme = useAppTheme as jest.Mock;
const mockedUseNetworkStatus = useNetworkStatus as jest.Mock;
const mockedGetCachedProduct = getCachedProduct as jest.Mock;
const mockedUseDispatch = useDispatch as unknown as jest.Mock;
const mockedUseSelector = useSelector as unknown as jest.Mock;

const product = {
  id: 1,
  title: 'Essence Mascara Lash Princess',
  description: 'The Essence Mascara gives your lashes volume.',
  category: 'beauty',
  price: 9.99,
  discountPercentage: 10.48,
  rating: 2.56,
  stock: 99,
  thumbnail: 'https://example.com/product.jpg',
  images: ['https://example.com/product.jpg'],
};

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

describe('ProductDetailScreen', () => {
  const dispatchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseAppTheme.mockReturnValue({
      mode: 'light',
      colors,
    });

    mockedUseNetworkStatus.mockReturnValue({
      isConnected: true,
    });

    mockedUseDispatch.mockReturnValue(dispatchMock);

    mockedUseSelector.mockImplementation((selector: Function) =>
      selector({
        cart: {
          items: [],
        },
        favorites: {
          items: [],
        },
      }),
    );

    mockedUseGetProductByIdQuery.mockReturnValue({
      data: product,
      isLoading: false,
      isError: false,
    });
  });

  const route = {
    params: {
      productId: 1,
    },
  };

  it('renders product details', async () => {
    const { getByText } = await render(
      <ProductDetailScreen route={route as any} navigation={{} as any} />,
    );

    expect(getByText(product.title)).toBeTruthy();
    expect(getByText(`$${product.price}`)).toBeTruthy();
    expect(getByText(`${product.discountPercentage}% OFF`)).toBeTruthy();
    expect(getByText(`⭐ ${product.rating}`)).toBeTruthy();
    expect(getByText(product.description)).toBeTruthy();
    expect(getByText('Add to Cart')).toBeTruthy();
  });

  it('shows loading state', async () => {
    mockedUseGetProductByIdQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const { getByTestId } = await render(
      <ProductDetailScreen route={route as any} navigation={{} as any} />,
    );

    expect(getByTestId('product-detail-loader')).toBeTruthy();
  });

  it('shows error state when product API fails', async () => {
    mockedUseGetProductByIdQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    const { getByText } = await render(
      <ProductDetailScreen route={route as any} navigation={{} as any} />,
    );

    expect(getByText('Unable to load product.')).toBeTruthy();
  });

  it('dispatches addToCart when Add to Cart is pressed', async () => {
    const { getByText } = await render(
      <ProductDetailScreen route={route as any} navigation={{} as any} />,
    );

    fireEvent.press(getByText('Add to Cart'));

    expect(dispatchMock).toHaveBeenCalledTimes(1);
  });

  it('dispatches favorite action when favorite button is pressed', async () => {
    const { getByText } = await render(
      <ProductDetailScreen route={route as any} navigation={{} as any} />,
    );

    fireEvent.press(getByText('♡'));

    expect(dispatchMock).toHaveBeenCalledTimes(1);
  });

  it('shows quantity controls when product is already in cart', async () => {
    mockedUseSelector.mockImplementation((selector: Function) =>
      selector({
        cart: {
          items: [
            {
              product,
              quantity: 2,
            },
          ],
        },
        favorites: {
          items: [],
        },
      }),
    );

    const { getByText } = await render(
      <ProductDetailScreen route={route as any} navigation={{} as any} />,
    );

    expect(getByText('2')).toBeTruthy();
    expect(getByText('+')).toBeTruthy();
    expect(getByText('−')).toBeTruthy();
  });

  it('dispatches increase quantity when plus is pressed', async () => {
    mockedUseSelector.mockImplementation((selector: Function) =>
      selector({
        cart: {
          items: [
            {
              product,
              quantity: 2,
            },
          ],
        },
        favorites: {
          items: [],
        },
      }),
    );

    const { getByText } = await render(
      <ProductDetailScreen route={route as any} navigation={{} as any} />,
    );

    fireEvent.press(getByText('+'));

    expect(dispatchMock).toHaveBeenCalledTimes(1);
  });

  it('dispatches decrease quantity when minus is pressed', async () => {
    mockedUseSelector.mockImplementation((selector: Function) =>
      selector({
        cart: {
          items: [
            {
              product,
              quantity: 2,
            },
          ],
        },
        favorites: {
          items: [],
        },
      }),
    );

    const { getByText } = await render(
      <ProductDetailScreen route={route as any} navigation={{} as any} />,
    );

    fireEvent.press(getByText('−'));

    expect(dispatchMock).toHaveBeenCalledTimes(1);
  });

  it('loads and renders cached product when offline', async () => {
    mockedUseNetworkStatus.mockReturnValue({
      isConnected: false,
    });

    mockedUseGetProductByIdQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });

    mockedGetCachedProduct.mockResolvedValue(product);

    const { getByText } = await render(
      <ProductDetailScreen route={route as any} navigation={{} as any} />,
    );

    expect(mockedGetCachedProduct).toHaveBeenCalledWith(1);

    expect(getByText(product.title)).toBeTruthy();
    expect(getByText(`$${product.price}`)).toBeTruthy();
  });
});
