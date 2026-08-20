import type { OrderCustomer } from './order-customer';
import type { OrderItem } from './order-item';
import type { OrderStatus } from './order-status';
import type { OrderDeliveryState } from '@/entities/order-delivery/types';

export type Order = OrderCustomer & {
  id: string;
  userId?: string;
  guestSessionId?: string;
  status: OrderStatus;
  capabilities: {
    canContinue: boolean;
    canRepeat: boolean;
    canRemove: boolean;
    removeAction?: 'delete' | 'cancel';
  };
  items: OrderItem[];
  totalAmount: number;
  delivery: OrderDeliveryState;
  createdAt: string;
  updatedAt: string;
};
