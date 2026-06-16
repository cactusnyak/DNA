import { httpClient } from '@/shared/api/http-client';

import type { CreateOrderPayload } from '../types/create-order-payload';
import type { Order } from '../types/order';

export function createOrder(
  payload: CreateOrderPayload,
  accessToken?: string,
) {
  return httpClient<Order, CreateOrderPayload>('/orders', {
    method: 'POST',
    body: payload,
    headers: accessToken
      ? {
        Authorization: `Bearer ${accessToken}`,
      }
      : undefined,
  });
}