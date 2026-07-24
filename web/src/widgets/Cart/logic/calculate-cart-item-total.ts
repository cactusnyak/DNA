import type { CartStoreItem } from '@/entities/cart';

export function calculateCartItemTotal(item: CartStoreItem) {
  return (item.configuredUnitPrice ?? item.product.price) * item.quantity;
}
