import { httpClient } from '@/shared/api/http-client';

export type SendOtpPayload = {
  login: string;
  mode: 'login' | 'register';
  nickname?: string;
  inviterReferralCode?: string;
};

export function sendOtp(payload: SendOtpPayload) {
  return httpClient<{ expiresInSeconds: number; resendAfterSeconds: number }>('/auth/otp/send', {
    method: 'POST',
    body: payload,
  });
}
