import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { DeliveryQuote } from '@/entities/delivery-quote';
import type { Product } from '@/entities/product';
import { OversizedDeliveryCalculator } from '@/widgets/OversizedDeliveryCalculator/OversizedDeliveryCalculator';

type Props = {
  product: Product;
  quantity?: number;
  configuredUnitPrice?: number;
  initialQuote?: DeliveryQuote;
  triggerLabel?: string;
  triggerClassName?: string;
  onAccepted?: (quote: DeliveryQuote) => void;
};

export function OversizedDeliveryModal({
  product,
  quantity = 1,
  configuredUnitPrice = product.price,
  initialQuote,
  triggerLabel = 'Рассчитать крупногабаритную доставку',
  triggerClassName,
  onAccepted,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='flex flex-col gap-2'>
      <p className='text-amber-700 dark:text-amber-300 text-xs'>
        Доставка не рассчитана
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
          quantity={quantity}
          configuredUnitPrice={configuredUnitPrice}
          initialQuote={initialQuote}
          onAccepted={onAccepted}
        />
      </Modal>
    </div>
  );
}
