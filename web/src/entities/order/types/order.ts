import type { OrderCustomer } from './order-customer';
import type { OrderItem } from './order-item';
import type { OrderStatus } from './order-status';

export type Order = OrderCustomer & {
  id: string;
  userId?: string;
  guestSessionId?: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
};