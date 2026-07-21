import type { OrderStatus } from '@/entities/order';

export const orderStatuses: OrderStatus[] = [
  'CREATED',
  'AWAITING_PAYMENT',
  'PAID',
  'SHIPPED',
  'DELIVERED',
  'CASHBACK_ACCRUED',
  'CANCELLED',
];
