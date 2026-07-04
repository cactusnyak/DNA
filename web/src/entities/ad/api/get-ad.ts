import { httpClient } from '@/shared/api/http-client';

import type { Ad } from '../types/ad';

export function getAd(adId: string) {
  return httpClient<Ad>(`/ads/${adId}`);
}
