import type { CartStoreItem } from '@/entities/cart';

export function calculateCartItemTotal(item: CartStoreItem) {
  return item.product.price * item.quantity;
}