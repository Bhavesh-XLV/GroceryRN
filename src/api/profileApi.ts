import { apiClient } from './client';
import { User } from '../types';

export async function getProfile(): Promise<User> {
  const response = await apiClient.get<User>('/auth/me');

  return response.data;
}
