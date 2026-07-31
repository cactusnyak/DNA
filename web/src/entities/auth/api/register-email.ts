import type { User } from '@/entities/user';
import { httpClient } from '@/shared/api/http-client';

export type RegisterEmailPayload = {
  email: string;
  password: string;
  nickname: string;
  inviterReferralCode?: string;
};

type RegisterEmailResponse = {
  user: User;
  accessToken: string;
};

export function registerEmail(payload: RegisterEmailPayload) {
  return httpClient<RegisterEmailResponse>('/auth/email/register', {
    method: 'POST',
    body: payload,
  });
}
