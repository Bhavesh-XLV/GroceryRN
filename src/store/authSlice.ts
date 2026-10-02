import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { login } from '../api/authApi';
import { clearTokens, saveTokens } from '../storage/secureStorage';
import { LoginRequest, User } from '../types';
import { getTokens } from '../storage/secureStorage';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  restoring: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  restoring: true,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (payload: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await login(payload);

      await saveTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });

      return response;
    } catch {
      return rejectWithValue('Invalid username or password');
    }
  },
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  await clearTokens();
});

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async () => {
    const tokens = await getTokens();

    return tokens;
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;

        state.user = {
          id: action.payload.id,
          username: action.payload.username,
          email: action.payload.email,
          firstName: action.payload.firstName,
          lastName: action.payload.lastName,
          image: action.payload.image,
        };

        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutUser.fulfilled, state => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = null;
      })
      .addCase(restoreSession.pending, state => {
        state.restoring = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.restoring = false;

        if (action.payload) {
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
        }
      })
      .addCase(restoreSession.rejected, state => {
        state.restoring = false;
      });
  },
});

export const { clearAuthError } = authSlice.actions;

export default authSlice.reducer;
