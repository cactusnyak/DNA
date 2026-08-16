import { httpClient } from '@/shared/api/http-client';

export function removeOrder(accessToken: string, orderId: string) {
  return httpClient<{ action: 'deleted' | 'cancelled' }>(`/orders/${orderId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
