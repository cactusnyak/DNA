import { httpClient } from '@/shared/api/http-client';

import type { Ad } from '../types/ad';

export function getMyAd(accessToken: string, adId: string) {
  return httpClient<Ad>(`/ads/my/${adId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
