import { httpClient } from '@/shared/api/http-client';

export function requestEmailVerification(email: string) {
  return httpClient<{ message: string }>('/auth/email/verification/request', {
    method: 'POST',
    body: { email },
  });
}
