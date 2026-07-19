import type { OAuthProvider } from '../types/oauth-provider';

export function getOAuthUrl(
  provider: OAuthProvider,
  mode: 'login' | 'register',
  inviterReferralCode?: string,
) {
  const baseUrl =
    import.meta.env.VITE_API_BASE_URL ?? window.location.origin;
  const url = new URL(`/api/auth/oauth/${provider}`, baseUrl);

  url.searchParams.set('mode', mode);

  if (inviterReferralCode) {
    url.searchParams.set('inviterReferralCode', inviterReferralCode);
  }

  return url.toString();
}
