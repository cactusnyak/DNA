import type { OrderCustomer } from './order-customer';
import type { CreateOrderItem } from './order-item';
import type { AddressSuggestion } from '@/entities/order-delivery';

export type CreateOrderPayload = OrderCustomer & {
  guestSessionId?: string;
  deliveryDestination?: AddressSuggestion;
  items: CreateOrderItem[];
};
