import { httpClient } from '@/shared/api/http-client';

import type { Ad } from '../types/ad';

export function getMyAds(accessToken: string) {
  return httpClient<Ad[]>('/ads/my', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
