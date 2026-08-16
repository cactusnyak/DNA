import { httpClient } from '@/shared/api/http-client';
import type { Product, SelectedProductAddition } from '@/entities/product';
import type { OrderCustomer } from '../types/order-customer';

export type RebuiltOrder = {
  sourceOrderId: string;
  customer: Required<OrderCustomer>;
  items: Array<{
    product: Product;
    quantity: number;
    selectedAdditions: SelectedProductAddition[];
  }>;
  requiresNewDeliveryQuote: boolean;
};

export function rebuildOrder(accessToken: string, orderId: string) {
  return httpClient<RebuiltOrder>(`/orders/${orderId}/rebuild`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
