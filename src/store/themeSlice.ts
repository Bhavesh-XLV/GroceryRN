import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  loading: boolean;
}

const THEME_STORAGE_KEY = '@grocery/theme';

const initialState: ThemeState = {
  mode: 'light',
  loading: false,
};

export const restoreTheme = createAsyncThunk(
  'theme/restoreTheme',
  async (): Promise<ThemeMode> => {
    const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);

    if (storedTheme === 'dark' || storedTheme === 'light') {
      return storedTheme;
    }

    return 'light';
  },
);

export const saveTheme = createAsyncThunk(
  'theme/saveTheme',
  async (mode: ThemeMode): Promise<ThemeMode> => {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);

    return mode;
  },
);

const themeSlice = createSlice({
  name: 'theme',

  initialState,

  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
    },

    toggleTheme: state => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
    },
  },

  extraReducers: builder => {
    builder.addCase(restoreTheme.fulfilled, (state, action) => {
      state.mode = action.payload;
      state.loading = false;
    });

    builder.addCase(restoreTheme.pending, state => {
      state.loading = true;
    });

    builder.addCase(restoreTheme.rejected, state => {
      state.loading = false;
    });

    builder.addCase(saveTheme.fulfilled, (state, action) => {
      state.mode = action.payload;
    });
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;

export default themeSlice.reducer;
