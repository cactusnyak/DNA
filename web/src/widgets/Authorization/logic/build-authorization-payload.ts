import type {
  LoginPayload,
  RegisterPayload,
} from '@/entities/auth';

import type { AuthorizationFormValue } from '../types/authorization-form';

function normalizeOptionalString(value: string) {
  const normalizedValue = value.trim();

  return normalizedValue || undefined;
}

export function buildLoginPayload(
  value: AuthorizationFormValue,
): LoginPayload {
  return {
    email: value.email.trim(),
    password: value.password,
  };
}

export function buildRegisterPayload(
  value: AuthorizationFormValue,
): RegisterPayload {
  return {
    email: value.email.trim(),
    password: value.password,
    nickname: value.nickname.trim(),
    phone: normalizeOptionalString(value.phone),
    inviterReferralCode: normalizeOptionalString(value.inviterReferralCode),
  };
}