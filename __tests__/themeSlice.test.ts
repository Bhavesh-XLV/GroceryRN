import { configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

import themeReducer, {
  restoreTheme,
  saveTheme,
  setTheme,
  toggleTheme,
} from '../src/store/themeSlice';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const createTestStore = () => {
  return configureStore({
    reducer: {
      theme: themeReducer,
    },
  });
};

describe('themeSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(null);
  });

  describe('setTheme', () => {
    it('sets the theme to dark', () => {
      const store = createTestStore();

      store.dispatch(setTheme('dark'));

      expect(store.getState().theme.mode).toBe('dark');
    });

    it('sets the theme to light', () => {
      const store = createTestStore();

      store.dispatch(setTheme('dark'));
      store.dispatch(setTheme('light'));

      expect(store.getState().theme.mode).toBe('light');
    });
  });

  describe('toggleTheme', () => {
    it('toggles light theme to dark', () => {
      const store = createTestStore();

      store.dispatch(toggleTheme());

      expect(store.getState().theme.mode).toBe('dark');
    });

    it('toggles dark theme to light', () => {
      const store = createTestStore();

      store.dispatch(toggleTheme());
      store.dispatch(toggleTheme());

      expect(store.getState().theme.mode).toBe('light');
    });
  });

  describe('restoreTheme', () => {
    it('restores dark theme from storage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('dark');

      const store = createTestStore();

      await store.dispatch(restoreTheme());

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@grocery/theme');

      expect(store.getState().theme.mode).toBe('dark');
      expect(store.getState().theme.loading).toBe(false);
    });

    it('restores light theme from storage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('light');

      const store = createTestStore();

      await store.dispatch(restoreTheme());

      expect(store.getState().theme.mode).toBe('light');
      expect(store.getState().theme.loading).toBe(false);
    });

    it('falls back to light for invalid stored theme', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid-theme');

      const store = createTestStore();

      await store.dispatch(restoreTheme());

      expect(store.getState().theme.mode).toBe('light');
      expect(store.getState().theme.loading).toBe(false);
    });

    it('falls back to light when no theme is stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const store = createTestStore();

      await store.dispatch(restoreTheme());

      expect(store.getState().theme.mode).toBe('light');
      expect(store.getState().theme.loading).toBe(false);
    });

    it('sets loading while restoring theme', async () => {
      let resolveStorage: (value: string | null) => void;

      const storagePromise = new Promise<string | null>(resolve => {
        resolveStorage = resolve;
      });

      (AsyncStorage.getItem as jest.Mock).mockReturnValue(storagePromise);

      const store = createTestStore();

      const promise = store.dispatch(restoreTheme());

      expect(store.getState().theme.loading).toBe(true);

      resolveStorage!(null);

      await promise;

      expect(store.getState().theme.loading).toBe(false);
    });
  });

  describe('saveTheme', () => {
    it('saves dark theme to storage', async () => {
      const store = createTestStore();

      await store.dispatch(saveTheme('dark'));

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@grocery/theme',
        'dark',
      );

      expect(store.getState().theme.mode).toBe('dark');
    });

    it('saves light theme to storage', async () => {
      const store = createTestStore();

      store.dispatch(setTheme('dark'));

      await store.dispatch(saveTheme('light'));

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@grocery/theme',
        'light',
      );

      expect(store.getState().theme.mode).toBe('light');
    });
  });
});
