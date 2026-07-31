import { httpClient } from '@/shared/api/http-client';

export function requestPasswordReset(email: string) {
  return httpClient<{ message: string }>('/auth/email/password-reset/request', {
    method: 'POST',
    body: { email },
  });
}
