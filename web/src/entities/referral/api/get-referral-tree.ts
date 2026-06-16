import { httpClient } from '@/shared/api/http-client';

import type { ReferralTreeUser } from '../types/referral-tree-user';

export function getReferralTree(accessToken: string) {
  return httpClient<ReferralTreeUser[]>('/referrals/tree', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}