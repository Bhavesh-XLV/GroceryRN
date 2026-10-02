export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  expiresInMins: number;
}

export interface LoginResponse extends AuthTokens {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
}
