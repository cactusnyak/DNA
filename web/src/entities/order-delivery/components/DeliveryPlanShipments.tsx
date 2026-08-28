import { useId, useState } from 'react';
import { ChevronDown, Clock3, Package, Truck } from 'lucide-react';

import { StatusBadge } from '@/components/ui/StatusBadge';

import { formatDeliveryInterval } from '../logic';
import type { DeliveryPlan } from '../types';

type DeliveryPlanShipmentsProps = {
  parts: DeliveryPlan['parts'];
};

export function DeliveryPlanShipments({ parts }: DeliveryPlanShipmentsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

  return (
    <div className="min-w-0 max-w-full">
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
          className="mt-2 flex min-w-0 flex-col gap-2 rounded-lg bg-muted/15 p-2"
        >
          {parts.map((part, index) => (
            <article
              key={part.partId}
              className="min-w-0 space-y-3 rounded-lg border border-border/60 bg-background p-3"
            >
              <header className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                <span className="font-medium">
                  Отправление {index + 1} из {parts.length}
                </span>
                <StatusBadge text={part.provider.name} />
              </header>

              <div className="flex min-w-0 items-start gap-2 text-xs">
                <Package className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 space-y-1">
                  {part.items.map((item) => (
                    <div key={item.orderItemId} className="break-words">
                      {item.title} × {item.quantity}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex min-w-0 items-start gap-2 text-xs text-muted-foreground">
                <Truck className="mt-0.5 size-3.5 shrink-0" />
                <span className="min-w-0 break-words">{part.service.name}</span>
              </div>

              <div className="flex min-w-0 items-start gap-2 text-xs text-muted-foreground">
                <Clock3 className="mt-0.5 size-3.5 shrink-0" />
                <span className="min-w-0 break-words">
                  {part.deliveryInterval
                    ? formatDeliveryInterval(part.deliveryInterval)
                    : 'Срок не указан'}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
