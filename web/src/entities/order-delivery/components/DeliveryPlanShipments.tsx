import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import type { DeliveryPlan } from '../types';
import { DeliveryPlanShipmentCard } from './DeliveryPlanShipmentCard';

type DeliveryPlanShipmentsProps = {
  parts: DeliveryPlan['parts'];
};

export function DeliveryPlanShipments({ parts }: DeliveryPlanShipmentsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

  return (
    <div className="flex min-w-0 max-w-full flex-col gap-2">
      <button
        type="button"
        className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-foreground outline-none transition-colors hover:text-primary focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsOpen((current) => !current);
        }}
      >
        <span>Состав доставки</span>
        <ChevronDown
          className={[
            'size-4 text-muted-foreground transition-transform',
            !isOpen && '-rotate-90',
          ]
            .filter(Boolean)
            .join(' ')}
          strokeWidth={1.5}
        />
      </button>

      {isOpen && (
        <div
          id={contentId}
          className="flex min-w-0 flex-col gap-2 rounded-lg bg-muted/15 p-2"
        >
          {parts.map((part, index) => (
            <DeliveryPlanShipmentCard
              key={part.partId}
              part={part}
              index={index}
              total={parts.length}
            />
          ))}
        </div>
      )}
    </div>
  );
}
