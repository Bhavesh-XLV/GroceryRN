import { apiClient } from './client';

interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<RefreshResponse> {
  const response = await apiClient.post<RefreshResponse>('/auth/refresh', {
    refreshToken,
    expiresInMins: 1,
  });

  return response.data;
}
