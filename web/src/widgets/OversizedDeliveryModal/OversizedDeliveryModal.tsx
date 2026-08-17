import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { DeliveryQuote } from '@/entities/delivery-quote';
import { isQuoteReady } from '@/entities/delivery-quote';
import type { Product } from '@/entities/product';
import { OversizedDeliveryCalculator } from '@/widgets/OversizedDeliveryCalculator/OversizedDeliveryCalculator';

type Props = {
  product: Product;
  cartLineKey: string;
  quantity?: number;
  configuredUnitPrice?: number;
  initialQuote?: DeliveryQuote;
  triggerLabel?: string;
  triggerClassName?: string;
  onQuoteChange?: (quote?: DeliveryQuote) => void;
};

export function OversizedDeliveryModal({
  product,
  cartLineKey,
  quantity = 1,
  configuredUnitPrice = product.price,
  initialQuote,
  triggerLabel = 'Рассчитать крупногабаритную доставку',
  triggerClassName,
  onQuoteChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const isReady = isQuoteReady(initialQuote, cartLineKey, quantity);
  const stateLabel = !initialQuote
    ? 'Доставка не рассчитана'
    : initialQuote.status === 'PENDING'
      ? 'Запрос отправлен — ожидает расчёта'
      : initialQuote.status === 'QUOTED'
        ? 'Расчёт получен — требуется принять'
        : isReady
          ? 'Расчёт принят — можно оформлять заказ'
          : initialQuote.status === 'EXPIRED'
            ? 'Срок расчёта истёк'
            : 'Расчёт отменён';

  return (
    <div className="flex flex-col gap-2">
      <p
        className={
          isReady
            ? 'text-success text-xs'
            : 'text-warning text-xs'
        }
      >
        {stateLabel}
      </p>
      <Button
        type="button"
        variant="outline"
        className={triggerClassName}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsOpen(true);
        }}
      >
        {triggerLabel}
      </Button>

      <Modal
        isOpen={isOpen}
        title={`Доставка «${product.title}»`}
        size="lg"
        bodyClassName="overflow-y-auto p-5"
        onClose={() => setIsOpen(false)}
      >
        <OversizedDeliveryCalculator
          product={product}
          cartLineKey={cartLineKey}
          quantity={quantity}
          configuredUnitPrice={configuredUnitPrice}
          initialQuote={initialQuote}
          onQuoteChange={onQuoteChange}
        />
      </Modal>
    </div>
  );
}
