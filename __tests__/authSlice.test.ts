import { configureStore } from '@reduxjs/toolkit';

import authReducer, {
  clearAuthError,
  loginUser,
  logoutUser,
  restoreSession,
} from '../src/store/authSlice';

import { login } from '../src/api/authApi';
import {
  clearTokens,
  getTokens,
  saveTokens,
} from '../src/storage/secureStorage';

jest.mock('../src/api/authApi', () => ({
  login: jest.fn(),
}));

jest.mock('../src/storage/secureStorage', () => ({
  clearTokens: jest.fn(),
  getTokens: jest.fn(),
  saveTokens: jest.fn(),
}));

const mockLoginResponse = {
  id: 1,
  username: 'emilys',
  email: 'emily@example.com',
  firstName: 'Emily',
  lastName: 'Johnson',
  image: 'https://example.com/emily.jpg',
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
};

const createTestStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
  });
};

describe('authSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (saveTokens as jest.Mock).mockResolvedValue(undefined);
    (clearTokens as jest.Mock).mockResolvedValue(undefined);
  });

  describe('loginUser', () => {
    it('logs in successfully and stores user and tokens', async () => {
      (login as jest.Mock).mockResolvedValue(mockLoginResponse);

      const store = createTestStore();

      await store.dispatch(
        loginUser({
          username: 'emilys',
          password: 'emilyspass',
          expiresInMins: 1,
        }),
      );

      const state = store.getState().auth;

      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();

      expect(state.user).toEqual({
        id: 1,
        username: 'emilys',
        email: 'emily@example.com',
        firstName: 'Emily',
        lastName: 'Johnson',
        image: 'https://example.com/emily.jpg',
      });

      expect(state.accessToken).toBe('access-token');
      expect(state.refreshToken).toBe('refresh-token');

      expect(saveTokens).toHaveBeenCalledWith({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('sets loading while login is pending', async () => {
      let resolveLogin: (value: typeof mockLoginResponse) => void;

      const loginPromise = new Promise<typeof mockLoginResponse>(resolve => {
        resolveLogin = resolve;
      });

      (login as jest.Mock).mockReturnValue(loginPromise);

      const store = createTestStore();

      const promise = store.dispatch(
        loginUser({
          username: 'emilys',
          password: 'emilyspass',
          expiresInMins: 1,
        }),
      );

      expect(store.getState().auth.loading).toBe(true);
      expect(store.getState().auth.error).toBeNull();

      resolveLogin!(mockLoginResponse);

      await promise;

      expect(store.getState().auth.loading).toBe(false);
    });

    it('sets error when login fails', async () => {
      (login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

      const store = createTestStore();

      await store.dispatch(
        loginUser({
          username: 'wrong',
          password: 'wrong',
          expiresInMins: 1,
        }),
      );

      const state = store.getState().auth;

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Invalid username or password');

      expect(saveTokens).not.toHaveBeenCalled();
    });
  });

  describe('logoutUser', () => {
    it('clears authentication state', async () => {
      const store = configureStore({
        reducer: {
          auth: authReducer,
        },
        preloadedState: {
          auth: {
            user: mockLoginResponse,
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            loading: false,
            restoring: false,
            error: 'old error',
          },
        },
      });

      await store.dispatch(logoutUser());

      const state = store.getState().auth;

      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.error).toBeNull();

      expect(clearTokens).toHaveBeenCalledTimes(1);
    });
  });

  describe('restoreSession', () => {
    it('restores saved tokens', async () => {
      (getTokens as jest.Mock).mockResolvedValue({
        accessToken: 'saved-access-token',
        refreshToken: 'saved-refresh-token',
      });

      const store = createTestStore();

      await store.dispatch(restoreSession());

      const state = store.getState().auth;

      expect(state.restoring).toBe(false);
      expect(state.accessToken).toBe('saved-access-token');
      expect(state.refreshToken).toBe('saved-refresh-token');
    });

    it('handles missing saved tokens', async () => {
      (getTokens as jest.Mock).mockResolvedValue(null);

      const store = createTestStore();

      await store.dispatch(restoreSession());

      const state = store.getState().auth;

      expect(state.restoring).toBe(false);
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
    });

    it('sets restoring to true while restoring session', async () => {
      let resolveTokens: (
        value: {
          accessToken: string;
          refreshToken: string;
        } | null,
      ) => void;

      const tokenPromise = new Promise<{
        accessToken: string;
        refreshToken: string;
      } | null>(resolve => {
        resolveTokens = resolve;
      });

      (getTokens as jest.Mock).mockReturnValue(tokenPromise);

      const store = createTestStore();

      const promise = store.dispatch(restoreSession());

      expect(store.getState().auth.restoring).toBe(true);

      resolveTokens!(null);

      await promise;

      expect(store.getState().auth.restoring).toBe(false);
    });
  });

  describe('clearAuthError', () => {
    it('clears the authentication error', () => {
      const store = configureStore({
        reducer: {
          auth: authReducer,
        },
        preloadedState: {
          auth: {
            user: null,
            accessToken: null,
            refreshToken: null,
            loading: false,
            restoring: false,
            error: 'Invalid username or password',
          },
        },
      });

      store.dispatch(clearAuthError());

      expect(store.getState().auth.error).toBeNull();
    });
  });
});
