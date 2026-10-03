import * as Keychain from 'react-native-keychain';

import {
  clearTokens,
  getTokens,
  saveTokens,
  updateAccessToken,
} from '../src/storage/secureStorage';

jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
}));

const mockTokens = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
};

describe('secureStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true);

    (Keychain.resetGenericPassword as jest.Mock).mockResolvedValue(true);
  });

  describe('saveTokens', () => {
    it('saves access and refresh tokens securely', async () => {
      await saveTokens(mockTokens);

      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        'auth',
        JSON.stringify(mockTokens),
        {
          service: 'com.groceryrn.auth',
        },
      );
    });
  });

  describe('getTokens', () => {
    it('returns stored tokens', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        username: 'auth',
        password: JSON.stringify(mockTokens),
      });

      const result = await getTokens();

      expect(Keychain.getGenericPassword).toHaveBeenCalledWith({
        service: 'com.groceryrn.auth',
      });

      expect(result).toEqual(mockTokens);
    });

    it('returns null when no credentials exist', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue(false);

      const result = await getTokens();

      expect(result).toBeNull();
    });
  });

  describe('clearTokens', () => {
    it('clears stored credentials', async () => {
      await clearTokens();

      expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
        service: 'com.groceryrn.auth',
      });
    });
  });

  describe('updateAccessToken', () => {
    it('updates the access token while preserving refresh token', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        username: 'auth',
        password: JSON.stringify(mockTokens),
      });

      await updateAccessToken('new-access-token');

      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        'auth',
        JSON.stringify({
          accessToken: 'new-access-token',
          refreshToken: 'refresh-token',
        }),
        {
          service: 'com.groceryrn.auth',
        },
      );
    });

    it('does nothing when no tokens are stored', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue(false);

      await updateAccessToken('new-access-token');

      expect(Keychain.setGenericPassword).not.toHaveBeenCalled();
    });
  });
});
