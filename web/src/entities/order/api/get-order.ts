import { httpClient } from '@/shared/api/http-client';
import type { Order } from '../types/order';

export function getOrder(accessToken: string, orderId: string) {
  return httpClient<Order>(`/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
