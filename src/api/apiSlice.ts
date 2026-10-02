import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { API_BASE_URL } from '../constants/config';
import { Product, ProductListResponse } from '../types';

export const apiSlice = createApi({
  reducerPath: 'api',

  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
  }),

  endpoints: builder => ({
    getProducts: builder.query<
      ProductListResponse,
      {
        limit: number;
        skip: number;
      }
    >({
      query: ({ limit, skip }) => ({
        url: '/products',
        params: {
          limit,
          skip,
        },
      }),
    }),

    searchProducts: builder.query<
      ProductListResponse,
      {
        query: string;
        limit: number;
        skip: number;
      }
    >({
      query: ({ query, limit, skip }) => ({
        url: '/products/search',
        params: {
          q: query,
          limit,
          skip,
        },
      }),
    }),

    getCategories: builder.query<string[], void>({
      query: () => '/products/categories',
    }),

    getProductsByCategory: builder.query<
      ProductListResponse,
      {
        category: string;
        limit: number;
        skip: number;
      }
    >({
      query: ({ category, limit, skip }) => ({
        url: `/products/category/${encodeURIComponent(category)}`,
        params: {
          limit,
          skip,
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
