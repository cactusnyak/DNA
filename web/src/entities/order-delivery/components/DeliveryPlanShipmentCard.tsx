import { Clock3, Package, Truck } from 'lucide-react';

import { StatusBadge } from '@/components/ui/StatusBadge';

import { formatDeliveryInterval } from '../logic';
import type { DeliveryPlan } from '../types';

type DeliveryPlanShipmentCardProps = {
  part: DeliveryPlan['parts'][number];
  index: number;
  total: number;
};

export function DeliveryPlanShipmentCard({
  part,
  index,
  total,
}: DeliveryPlanShipmentCardProps) {
  return (
    <article className="flex min-w-0 flex-col gap-3 rounded-lg border border-border/60 bg-background p-3">
      <header className="flex min-w-0 flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium">
          Отправление {index + 1} из {total}
        </span>
        <StatusBadge text={part.provider.name} />
      </header>

      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex min-w-0 items-start gap-2 text-xs">
          <span className="flex h-4 shrink-0 items-center">
            <Package className="size-3.5 text-muted-foreground" />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            {part.items.map((item) => (
              <div key={item.orderItemId} className="break-words">
                {item.title} × {item.quantity}
              </div>
            ))}
          </div>
        </div>

        <div className="flex min-w-0 items-start gap-2 text-xs text-muted-foreground">
          <span className="flex h-4 shrink-0 items-center">
            <Truck className="size-3.5" />
          </span>
          <span className="min-w-0 break-words">{part.service.name}</span>
        </div>

        <div className="flex min-w-0 items-start gap-2 text-xs text-muted-foreground">
          <span className="flex h-4 shrink-0 items-center">
            <Clock3 className="size-3.5" />
          </span>
          <span className="min-w-0 break-words">
            {part.deliveryInterval
              ? formatDeliveryInterval(part.deliveryInterval)
              : 'Срок не указан'}
          </span>
        </div>
      </div>
    </article>
  );
}
