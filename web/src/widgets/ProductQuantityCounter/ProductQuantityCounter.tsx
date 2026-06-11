import { Minus, Plus } from 'lucide-react';

import { useCartStore } from '@/entities/cart';
import { cn } from '@/shared/utils/cn';

export type ProductQuantityCounterVariant = 'card' | 'details';

type ProductQuantityCounterProps = {
  productId: string;
  variant?: ProductQuantityCounterVariant;
};

export function getProductActionHeightClass(
  variant: ProductQuantityCounterVariant,
) {
  return variant === 'details' ? 'h-9' : 'h-8';
}

export function ProductQuantityCounter({
  productId,
  variant = 'card',
}: ProductQuantityCounterProps) {
  const quantity = useCartStore((state) => state.getItemQuantity(productId));
  const increaseItem = useCartStore((state) => state.increaseItem);
  const decreaseItem = useCartStore((state) => state.decreaseItem);

  return (
    <div
      className={cn(
        'grid grid-cols-[2.25rem_1fr_2.25rem] overflow-hidden rounded-lg border border-border bg-background',
        getProductActionHeightClass(variant),
      )}
    >
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