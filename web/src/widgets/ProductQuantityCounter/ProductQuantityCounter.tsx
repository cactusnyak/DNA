import { Minus, Plus } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/entities/cart';

type ProductQuantityCounterProps = {
  productId: string;
};

export function ProductQuantityCounter({
  productId,
}: ProductQuantityCounterProps) {
  const quantity = useCartStore((state) => state.getItemQuantity(productId));
  const increaseItem = useCartStore((state) => state.increaseItem);
  const decreaseItem = useCartStore((state) => state.decreaseItem);

  return (
    <div className="grid h-8 grid-cols-[2.25rem_1fr_2.25rem] overflow-hidden rounded-lg border border-border bg-background">
      <button
        type="button"
        className="flex h-full items-center justify-center transition-colors hover:bg-muted"
        onClick={() => decreaseItem(productId)}
      >
        <Minus className="size-4" />
      </button>

      <div className="flex items-center justify-center text-sm font-medium">
        {quantity}
      </div>

      <button
        type="button"
        className="flex h-full items-center justify-center transition-colors hover:bg-muted"
        onClick={() => increaseItem(productId)}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}