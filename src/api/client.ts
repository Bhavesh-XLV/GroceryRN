import axios, { InternalAxiosRequestConfig } from 'axios';

import { API_BASE_URL } from '../constants/config';
import { refreshAccessToken } from './authRefresh';
import { clearTokens, getTokens, saveTokens } from '../storage/secureStorage';

interface RetryRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise: Promise<string> | null = null;

apiClient.interceptors.request.use(async config => {
  const tokens = await getTokens();

  if (tokens) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config as RetryRequestConfig;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const tokens = await getTokens();

    if (!tokens?.refreshToken) {
      await clearTokens();
      return Promise.reject(error);
    }

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken(tokens.refreshToken)
          .then(async response => {
            const newRefreshToken =
              response.refreshToken || tokens.refreshToken;

            await saveTokens({
              accessToken: response.accessToken,
              refreshToken: newRefreshToken,
            });

            return response.accessToken;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newAccessToken = await refreshPromise;

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      await clearTokens();

      return Promise.reject(refreshError);
    }
  },
);
