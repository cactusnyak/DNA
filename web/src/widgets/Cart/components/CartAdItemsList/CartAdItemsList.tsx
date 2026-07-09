import type { CartAdItem } from '@/entities/cart';

import { CartAdItemCard } from '../CartAdItemCard/CartAdItemCard';

type CartAdItemsListProps = {
  adItems: CartAdItem[];
  onRemove: (adId: string) => void;
};

export function CartAdItemsList({ adItems, onRemove }: CartAdItemsListProps) {
  return (
    <div className="space-y-3">
      {adItems.map((item) => (
        <CartAdItemCard key={item.ad.id} item={item} onRemove={onRemove} />
      ))}
    </div>
  );
}
