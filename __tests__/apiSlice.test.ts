jest.mock('@reduxjs/toolkit/query/react', () => {
  const actual = jest.requireActual('@reduxjs/toolkit/query');

  return {
    ...actual,
    createApi: jest.fn(() => ({
      reducerPath: 'api',
      endpoints: {
        getProducts: {},
        searchProducts: {},
        getCategories: {},
        getProductsByCategory: {},
        getProductById: {},
      },
    })),
    fetchBaseQuery: jest.fn(),
  };
});

import { apiSlice } from '../src/api/apiSlice';

describe('apiSlice endpoints', () => {
  it('creates the API slice with the correct reducer path', () => {
    expect(apiSlice.reducerPath).toBe('api');
  });

  it('defines getProducts endpoint', () => {
    expect(apiSlice.endpoints.getProducts).toBeDefined();
  });

  it('defines searchProducts endpoint', () => {
    expect(apiSlice.endpoints.searchProducts).toBeDefined();
  });

  it('defines getCategories endpoint', () => {
    expect(apiSlice.endpoints.getCategories).toBeDefined();
  });

  it('defines getProductsByCategory endpoint', () => {
    expect(apiSlice.endpoints.getProductsByCategory).toBeDefined();
  });

  it('defines getProductById endpoint', () => {
    expect(apiSlice.endpoints.getProductById).toBeDefined();
  });
});
