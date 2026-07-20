import type {
  SendOtpPayload,
  VerifyOtpPayload,
} from '@/entities/auth';

import type { AuthorizationMode } from '../types/authorization-form';
import type { AuthorizationFormValue } from '../types/authorization-form';

function normalizeOptionalString(value: string) {
  const normalizedValue = value.trim();

  return normalizedValue || undefined;
}

export function buildSendOtpPayload(
  value: AuthorizationFormValue,
  mode: AuthorizationMode,
): SendOtpPayload {
  return {
    login: value.login.trim(),
    mode,
    nickname: mode === 'register' ? value.nickname.trim() : undefined,
    inviterReferralCode: normalizeOptionalString(value.inviterReferralCode),
  };
}

export function buildVerifyOtpPayload(
  value: AuthorizationFormValue,
  mode: AuthorizationMode,
): VerifyOtpPayload {
  return {
    login: value.login.trim(),
    mode,
    code: value.otpCode.trim(),
    nickname: mode === 'register' ? value.nickname.trim() : undefined,
    inviterReferralCode: normalizeOptionalString(value.inviterReferralCode),
  };
}