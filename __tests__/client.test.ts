import axios from 'axios';
import { getTokens, saveTokens } from '../src/storage/secureStorage';
import { refreshAccessToken } from '../src/api/authRefresh';

jest.mock('../src/api/authRefresh');
jest.mock('../src/storage/secureStorage');

describe('apiClient token refresh', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (getTokens as jest.Mock).mockResolvedValue({
      accessToken: 'old-access-token',
      refreshToken: 'refresh-token',
    });

    (refreshAccessToken as jest.Mock).mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'refresh-token',
    });
  });

  it('refreshes the token when API returns 401', async () => {
    const adapter = jest.fn();

    adapter
      .mockRejectedValueOnce({
        response: {
          status: 401,
        },
        config: {
          headers: {},
        },
      })
      .mockResolvedValueOnce({
        status: 200,
        data: {
          success: true,
        },
      });

    const testClient = axios.create({
      adapter,
    });

    testClient.interceptors.request.use(async config => {
      const tokens = await getTokens();

      if (tokens) {
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      }

      return config;
    });

    testClient.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;

        if (error.response.status !== 401) {
          throw error;
        }

        const tokens = await getTokens();

        const response = await refreshAccessToken(tokens.refreshToken);

        await saveTokens({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });

        originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;

        return testClient(originalRequest);
      },
    );

    const response = await testClient.get('/test');

    expect(response.status).toBe(200);

    expect(refreshAccessToken).toHaveBeenCalledTimes(1);

    expect(saveTokens).toHaveBeenCalledWith({
      accessToken: 'new-access-token',
      refreshToken: 'refresh-token',
    });
  });
});
