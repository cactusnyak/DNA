import type { User } from '@/entities/user';
import { httpClient } from '@/shared/api/http-client';

import { useAuthStore } from '../model/auth-store';

export function getCurrentUser() {
  const accessToken = useAuthStore.getState().accessToken;

  if (!accessToken) {
    return Promise.resolve(undefined);
  }

  return httpClient<User>('/auth/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}