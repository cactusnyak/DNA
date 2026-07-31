import { httpClient } from '@/shared/api/http-client';

export function confirmPasswordReset(token: string, newPassword: string) {
  return httpClient<{ message: string }>('/auth/email/password-reset/confirm', {
    method: 'POST',
    body: { token, newPassword },
  });
}
