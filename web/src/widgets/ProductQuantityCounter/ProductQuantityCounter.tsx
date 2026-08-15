import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/entities/auth';
import { useCartStore } from '@/entities/cart';
import {
  cancelDeliveryQuote,
  quoteNeedsInvalidation,
} from '@/entities/delivery-quote';
import { useSessionStore } from '@/entities/session';

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
  const item = useCartStore((state) =>
    state.items.find(
      (value) =>
        value.configurationKey === productId || value.product.id === productId,
    ),
  );
  const quantity = item?.quantity ?? 0;
  const increaseItem = useCartStore((state) => state.increaseItem);
  const decreaseItem = useCartStore((state) => state.decreaseItem);
  const token = useAuthStore((state) => state.accessToken);
  const guestSessionId = useSessionStore((state) => state.guestSessionId);
  const [pendingDirection, setPendingDirection] = useState<
    'increase' | 'decrease'
  >();
  const [isInvalidating, setIsInvalidating] = useState(false);
  const [error, setError] = useState<string>();

  const changeQuantity = (direction: 'increase' | 'decrease') => {
    const quote = item?.deliveryQuote;
    if (quote && quoteNeedsInvalidation(quote.status)) {
      setPendingDirection(direction);
      setError(undefined);
      return;
    }
    (direction === 'increase' ? increaseItem : decreaseItem)(productId);
  };

  const confirmChange = async () => {
    if (!pendingDirection || !item?.deliveryQuote) return;
    setIsInvalidating(true);
    setError(undefined);
    try {
      await cancelDeliveryQuote(item.deliveryQuote.id, guestSessionId, token);
      (pendingDirection === 'increase' ? increaseItem : decreaseItem)(
        productId,
      );
      setPendingDirection(undefined);
    } catch {
      setError('Не удалось отменить текущий расчёт. Количество не изменено.');
    } finally {
      setIsInvalidating(false);
    }
  };

  return (
    <div
      className={[
        'grid grid-cols-[2.25rem_1fr_2.25rem] overflow-hidden rounded-lg border border-border/80 bg-background',
        getProductActionHeightClass(variant),
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        className="flex h-full cursor-pointer items-center justify-center hover:bg-muted"
        onClick={() => changeQuantity('decrease')}
      >
        <Minus className="size-4" />
      </button>

      <div className="flex items-center justify-center text-sm font-medium">
        {quantity}
      </div>

      <button
        type="button"
        className="flex h-full cursor-pointer items-center justify-center hover:bg-muted"
        onClick={() => changeQuantity('increase')}
      >
        <Plus className="size-4" />
      </button>
      <Modal
        isOpen={Boolean(pendingDirection)}
        title="Изменить количество?"
        size="sm"
        className="h-auto"
        bodyClassName="gap-4 overflow-visible p-5"
        onClose={() => !isInvalidating && setPendingDirection(undefined)}
      >
        <p className="text-sm text-muted-foreground">
          Текущий расчёт доставки зависит от количества и будет отменён. Для
          нового количества потребуется новый расчёт.
        </p>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={isInvalidating}
            onClick={() => setPendingDirection(undefined)}
          >
            Оставить как есть
          </Button>
          <Button
            type="button"
            variant="accent"
            disabled={isInvalidating}
            onClick={confirmChange}
          >
            {isInvalidating ? 'Отменяем расчёт…' : 'Изменить количество'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
