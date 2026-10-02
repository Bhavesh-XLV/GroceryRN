import * as Keychain from 'react-native-keychain';

import { AuthTokens } from '../types';

const SERVICE = 'com.groceryrn.auth';

export async function saveTokens(tokens: AuthTokens): Promise<void> {
  await Keychain.setGenericPassword('auth', JSON.stringify(tokens), {
    service: SERVICE,
  });
}

export async function getTokens(): Promise<AuthTokens | null> {
  const credentials = await Keychain.getGenericPassword({
    service: SERVICE,
  });

  if (!credentials) {
    return null;
  }

  return JSON.parse(credentials.password) as AuthTokens;
}

export async function clearTokens(): Promise<void> {
  await Keychain.resetGenericPassword({
    service: SERVICE,
  });
}

export async function updateAccessToken(accessToken: string): Promise<void> {
  const tokens = await getTokens();

  if (!tokens) {
    return;
  }

  await saveTokens({
    accessToken,
    refreshToken: tokens.refreshToken,
  });
}
