import type { OrderCustomer } from './order-customer';
import type { CreateOrderItem } from './order-item';

export type CreateOrderPayload = OrderCustomer & {
  guestSessionId?: string;
  items: CreateOrderItem[];
};