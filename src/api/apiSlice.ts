import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { API_BASE_URL } from '../constants/config';
import {
  Product,
  ProductListResponse,
  ProductSortBy,
  SortOrder,
} from '../types';

interface ProductQueryParams {
  limit: number;
  skip: number;
  sortBy?: ProductSortBy;
  order?: SortOrder;
}

interface SearchProductQueryParams extends ProductQueryParams {
  query: string;
}

interface CategoryProductQueryParams extends ProductQueryParams {
  category: string;
}

export const apiSlice = createApi({
  reducerPath: 'api',

  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
  }),

  endpoints: builder => ({
    getProducts: builder.query<ProductListResponse, ProductQueryParams>({
      query: ({ limit, skip, sortBy, order }) => ({
        url: '/products',
        params: {
          limit,
          skip,
          ...(sortBy ? { sortBy } : {}),
          ...(order ? { order } : {}),
        },
      }),
    }),

    searchProducts: builder.query<
      ProductListResponse,
      SearchProductQueryParams
    >({
      query: ({ query, limit, skip, sortBy, order }) => ({
        url: '/products/search',
        params: {
          q: query,
          limit,
          skip,
          ...(sortBy ? { sortBy } : {}),
          ...(order ? { order } : {}),
        },
      }),
    }),

    getCategories: builder.query<
      Array<{
        slug: string;
        name: string;
        url: string;
      }>,
      void
    >({
      query: () => '/products/categories',
    }),

    getProductsByCategory: builder.query<
      ProductListResponse,
      CategoryProductQueryParams
    >({
      query: ({ category, limit, skip, sortBy, order }) => ({
        url: `/products/category/${encodeURIComponent(category)}`,
        params: {
          limit,
          skip,
          ...(sortBy ? { sortBy } : {}),
          ...(order ? { order } : {}),
        },
      }),
    }),

    getProductById: builder.query<Product, number>({
      query: id => `/products/${id}`,
    }),
  }),
});

export const {
  useGetProductsQuery,
  useSearchProductsQuery,
  useGetCategoriesQuery,
  useGetProductsByCategoryQuery,
  useGetProductByIdQuery,
} = apiSlice;
