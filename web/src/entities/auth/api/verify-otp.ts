import { httpClient } from '@/shared/api/http-client';

import type { AuthResponse } from '../types/auth-response';

export type VerifyOtpPayload = {
  login: string;
  mode: 'login' | 'register';
  code: string;
  nickname?: string;
  inviterReferralCode?: string;
};

export function verifyOtp(payload: VerifyOtpPayload) {
  return httpClient<AuthResponse>('/auth/otp/verify', {
    method: 'POST',
    body: payload,
  });
}
