const AUTHORIZATION_REFERRAL_CODE_STORAGE_KEY = 'dna.inviterReferralCode';

export function normalizeAuthorizationReferralCode(value?: string | null) {
  return value?.trim() ?? '';
}

export function getAuthorizationReferralCodeFromSearchParams(
  searchParams: URLSearchParams,
) {
  return normalizeAuthorizationReferralCode(searchParams.get('ref'));
}

export function getStoredAuthorizationReferralCode() {
  if (typeof window === 'undefined') {
    return '';
  }

  return normalizeAuthorizationReferralCode(
    window.sessionStorage.getItem(AUTHORIZATION_REFERRAL_CODE_STORAGE_KEY),
  );
}

export function saveAuthorizationReferralCode(value: string) {
  const normalizedValue = normalizeAuthorizationReferralCode(value);

  if (!normalizedValue || typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(
    AUTHORIZATION_REFERRAL_CODE_STORAGE_KEY,
    normalizedValue,
  );
}