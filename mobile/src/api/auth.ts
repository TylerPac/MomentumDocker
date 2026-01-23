import { apiRequest } from './http';

type AuthLoginRequest = {
  username: string;
  password: string;
};

type AuthRegisterRequest = {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type UserDto = {
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
};

type AuthTokenResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserDto;
};

export async function authLogin(request: AuthLoginRequest): Promise<AuthTokenResponse> {
  return apiRequest<AuthTokenResponse>('/api/auth/login', 'POST', request);
}

export async function authRegister(request: AuthRegisterRequest): Promise<AuthTokenResponse> {
  return apiRequest<AuthTokenResponse>('/api/auth/register', 'POST', request);
}
