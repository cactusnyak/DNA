import type { OrderItem } from './order-item';
import type { OrderStatus } from './order-status';

export type Order = {
  id: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
};