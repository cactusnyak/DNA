import { httpClient } from '@/shared/api/http-client';

export function confirmEmailVerification(token: string) {
  return httpClient<{ message: string }>('/auth/email/verification/confirm', {
    method: 'POST',
    body: { token },
  });
}
