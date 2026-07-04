import { httpClient } from '@/shared/api/http-client';

export function deleteAd(accessToken: string, adId: string) {
  return httpClient<void>(`/ads/${adId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
