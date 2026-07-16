import type { CartStoreItem } from '@/entities/cart';

import { CartProductItemCard } from '../CartProductItemCard';

type CartItemsListProps = {
  items: CartStoreItem[];
  onRemove: (productId: string) => void;
};

export function CartItemsList({ items, onRemove }: CartItemsListProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <CartProductItemCard
          key={item.product.id}
          item={item}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}