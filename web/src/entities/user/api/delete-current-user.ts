import { httpClient } from '@/shared/api/http-client';

export function deleteCurrentUser(accessToken: string) {
  return httpClient<void>('/users/me', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}