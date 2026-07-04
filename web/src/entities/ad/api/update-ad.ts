import { httpClient } from '@/shared/api/http-client';

import type { Ad } from '../types/ad';
import type { UpdateAdPayload } from '../types/ad-payload';

export function updateAd(
  accessToken: string,
  adId: string,
  payload: UpdateAdPayload,
) {
  return httpClient<Ad, UpdateAdPayload>(`/ads/${adId}`, {
    method: 'PATCH',
    body: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
