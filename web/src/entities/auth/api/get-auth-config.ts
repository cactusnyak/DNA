import { httpClient } from '@/shared/api/http-client';

import type { AuthConfig } from '../types/auth-config';

export function getAuthConfig() {
  return httpClient<AuthConfig>('/auth/config');
}
