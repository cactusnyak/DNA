import type { OrderCustomer } from './order-customer';
import type { OrderItem } from './order-item';
import type { OrderStatus } from './order-status';

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
  createdAt: string;
  updatedAt: string;
};
