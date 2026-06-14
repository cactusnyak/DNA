import { httpClient } from '@/shared/api/http-client';

import type { AuthResponse } from '../types/auth-response';
import type { LoginPayload } from '../types/login-payload';

export function login(payload: LoginPayload) {
  return httpClient<AuthResponse, LoginPayload>('/auth/login', {
    method: 'POST',
    body: payload,
  });
}