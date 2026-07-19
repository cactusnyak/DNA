import { httpClient } from '@/shared/api/http-client';

import type { User } from '../types/user';

export type UpdateCurrentUserPayload = {
  nickname?: string;
  firstName?: string;
  lastName?: string;
  patronymic?: string;
  phone?: string;
  avatarId?: string | null;
};

export function updateCurrentUser(
  accessToken: string,
  payload: UpdateCurrentUserPayload,
): Promise<User> {
  return httpClient<User>('/users/me', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: payload,
  });
}
