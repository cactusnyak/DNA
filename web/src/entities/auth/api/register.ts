import { httpClient } from '@/shared/api/http-client';

import type { AuthResponse } from '../types/auth-response';
import type { RegisterPayload } from '../types/register-payload';

export function register(payload: RegisterPayload) {
  return httpClient<AuthResponse, RegisterPayload>('/auth/register', {
    method: 'POST',
    body: payload,
  });
}