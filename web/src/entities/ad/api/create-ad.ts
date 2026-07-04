import { httpClient } from '@/shared/api/http-client';

import type { Ad } from '../types/ad';
import type { CreateAdPayload } from '../types/ad-payload';

export function createAd(accessToken: string, payload: CreateAdPayload) {
  return httpClient<Ad, CreateAdPayload>('/ads', {
    method: 'POST',
    body: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
