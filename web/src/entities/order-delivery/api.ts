import { httpClient } from '@/shared/api/http-client';
import type { Order } from '@/entities/order';
import type {
  DeliveryCredentials,
  AddressSuggestion,
  OrderDeliveryState,
  UpdateDestinationPayload,
} from './types';

export const suggestDeliveryAddresses = (query: string) =>
  httpClient<AddressSuggestion[], { query: string }>(
    '/delivery/locations/suggest',
    { method: 'POST', body: { query } },
  );

const headers = ({ accessToken, guestSessionId }: DeliveryCredentials) => ({
  ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  ...(!accessToken && guestSessionId
    ? { 'X-Guest-Session-Id': guestSessionId }
    : {}),
});

export const resolveDeliveryLocation = (query: string) =>
  httpClient<
    Pick<
      UpdateDestinationPayload,
      | 'country'
      | 'city'
      | 'fullAddress'
      | 'latitude'
      | 'longitude'
      | 'externalLocationId'
    >,
    { query: string }
  >('/delivery/locations/resolve', { method: 'POST', body: { query } });

export const updateOrderDestination = (
  orderId: string,
  body: UpdateDestinationPayload,
  credentials: DeliveryCredentials,
) =>
  httpClient<OrderDeliveryState, UpdateDestinationPayload>(
    `/orders/${orderId}/delivery/destination`,
    {
      method: 'PUT',
      body,
      headers: headers(credentials),
    },
  );

export const calculateOrderDelivery = (
  orderId: string,
  credentials: DeliveryCredentials,
) =>
  httpClient<OrderDeliveryState>(`/orders/${orderId}/delivery/quotes`, {
    method: 'POST',
    headers: headers(credentials),
  });

export const updateOrderDeliveryPlan = (
  orderId: string,
  body: { planId: string | null; pricingVersion: number },
  credentials: DeliveryCredentials,
) =>
  httpClient<OrderDeliveryState, typeof body>(
    `/orders/${orderId}/delivery/plan`,
    {
      method: 'PUT',
      body,
      headers: headers(credentials),
    },
  );

export type OrderWithDelivery = Order;
