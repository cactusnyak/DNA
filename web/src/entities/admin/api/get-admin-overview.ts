import { httpClient } from '@/shared/api/http-client';

import type { AdminOverview } from '../types/admin-overview';

export function getAdminOverview(accessToken: string) {
  return httpClient<AdminOverview>('/admin/overview', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}