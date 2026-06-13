import type { Product } from '@/entities/product';

export type CreateOrderItem = {
  productId: string;
  quantity: number;
};

export type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product?: Product;
};