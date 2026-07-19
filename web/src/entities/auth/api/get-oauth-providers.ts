import { httpClient } from '@/shared/api/http-client';

import type { OAuthProvider } from '../types/oauth-provider';

export function getOAuthProviders() {
  return httpClient<OAuthProvider[]>('/auth/oauth/providers');
}
