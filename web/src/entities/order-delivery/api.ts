import { httpClient } from '@/shared/api/http-client';
import type { Order } from '@/entities/order';
import type { DeliveryCredentials, OrderDeliveryState, UpdateDestinationPayload } from './types';

const headers = ({ accessToken, guestSessionId }: DeliveryCredentials) => ({
  ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  ...(!accessToken && guestSessionId ? { 'X-Guest-Session-Id': guestSessionId } : {}),
});

export const resolveDeliveryLocation = (query: string) =>
  httpClient<Pick<UpdateDestinationPayload, 'country' | 'city' | 'fullAddress' | 'latitude' | 'longitude' | 'externalLocationId'>, { query: string }>(
    '/delivery/locations/resolve', { method: 'POST', body: { query } },
  );

export const updateOrderDestination = (orderId: string, body: UpdateDestinationPayload, credentials: DeliveryCredentials) =>
  httpClient<OrderDeliveryState, UpdateDestinationPayload>(`/orders/${orderId}/delivery/destination`, {
    method: 'PUT', body, headers: headers(credentials),
  });

export type CalculateDeliveryResponse = {
  orderId: string;
  groups: unknown[];
  unavailableItems: unknown[];
  readiness: string;
  readyForSelection: boolean;
};

export const calculateOrderDelivery = (orderId: string, credentials: DeliveryCredentials) =>
  httpClient<CalculateDeliveryResponse>(`/orders/${orderId}/delivery/quotes`, {
    method: 'POST', headers: headers(credentials),
  });

export const updateOrderDeliverySelections = (
  orderId: string,
  body: { selections: Array<{ groupKey: string; quoteId: string }>; pricingVersion: number },
  credentials: DeliveryCredentials,
) => httpClient<OrderDeliveryState, typeof body>(`/orders/${orderId}/delivery/selections`, {
  method: 'PUT', body, headers: headers(credentials),
});

export type OrderWithDelivery = Order;
