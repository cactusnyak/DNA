import type { Product } from '@/entities/product';
import type { SelectedProductAddition } from '@/entities/product';

export type CreateOrderItem = {
  productId: string;
  quantity: number;
  selectedAdditions: SelectedProductAddition[];
};

export type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  baseUnitPrice: number;
  unitPrice: number;
  selectedAdditions: Array<{
    additionId: string;
    type: 'boolean' | 'quantity';
    title: string;
    value: boolean | number;
    unitLabel?: string;
    unitPrice: number;
    totalPrice: number;
  }>;
  product?: Product;
};
