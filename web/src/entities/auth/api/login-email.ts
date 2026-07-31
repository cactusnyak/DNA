import type { User } from '@/entities/user';
import { httpClient } from '@/shared/api/http-client';

export type LoginEmailPayload = {
  email: string;
  password: string;
};

type LoginEmailResponse = {
  user: User;
  accessToken: string;
};

export function loginEmail(payload: LoginEmailPayload) {
  return httpClient<LoginEmailResponse>('/auth/email/login', {
    method: 'POST',
    body: payload,
  });
}
