import { apiClient } from '../src/api/client';
import { login } from '../src/api/authApi';

jest.mock('../src/api/client', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

describe('authApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls login API with correct payload and returns response data', async () => {
    const payload = {
      username: 'emilys',
      password: 'emilyspass',
      expiresInMins: 1,
    };

    const responseData = {
      id: 1,
      username: 'emilys',
      email: 'emily@example.com',
      firstName: 'Emily',
      lastName: 'Johnson',
      image: 'https://example.com/image.jpg',
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };

    (apiClient.post as jest.Mock).mockResolvedValue({
      data: responseData,
    });

    const result = await login(payload);

    expect(apiClient.post).toHaveBeenCalledTimes(1);
    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', payload);
    expect(result).toEqual(responseData);
  });

  it('propagates API errors', async () => {
    const payload = {
      username: 'wrong-user',
      password: 'wrong-password',
      expiresInMins: 1,
    };

    const error = new Error('Login failed');

    (apiClient.post as jest.Mock).mockRejectedValue(error);

    await expect(login(payload)).rejects.toThrow('Login failed');

    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', payload);
  });
});
