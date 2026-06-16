import { httpClient } from '@/shared/api/http-client';

import type { Order } from '../types/order';

export function getMyOrders(accessToken: string) {
  return httpClient<Order[]>('/orders/my', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}