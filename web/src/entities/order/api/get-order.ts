import { httpClient } from '@/shared/api/http-client';
import type { Order } from '../types/order';

export function getOrder(orderId: string, accessToken?: string, guestSessionId?: string) {
  return httpClient<Order>(`/orders/${orderId}`, {
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(!accessToken && guestSessionId ? { 'X-Guest-Session-Id': guestSessionId } : {}),
    },
  });
}
