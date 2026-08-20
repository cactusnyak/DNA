import { type ReactNode, useState } from 'react';

import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatPrice } from '@/shared/utils/format-price';

import { formatDeliveryInterval, getQuoteTimeState } from '../logic';
import type { DeliveryPlan } from '../types';

type DeliveryPlanCardProps = {
  plan: DeliveryPlan;
  selected?: boolean;
  bordered?: boolean;
  control?: ReactNode;
  now?: number;
};

const badgeLabels = {
  RECOMMENDED: 'Рекомендуем',
  CHEAPEST: 'Самая выгодная',
  FASTEST: 'Самая быстрая',
} as const;

export function DeliveryPlanCard({
  plan,
  selected = false,
  bordered = true,
  control,
  now,
}: DeliveryPlanCardProps) {
  const [renderedAt] = useState(() => Date.now());
  const timeState = getQuoteTimeState(plan.expiresAt, now ?? renderedAt);
  const className = [
    'block rounded-2xl p-4',
    control && 'cursor-pointer',
    bordered && 'border',
    bordered && (selected ? 'border-primary' : 'border-border/80'),
    selected && 'bg-primary/3',
  ].filter(Boolean).join(' ');
  const content = (
    <div className="flex items-start gap-3">
      {control && <div className="flex pt-1">{control}</div>}
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <span className="font-medium">{plan.title}</span>
          <span className="font-semibold text-primary">{formatPrice(plan.customerPrice)}</span>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <span className="flex flex-wrap gap-2">
            {plan.badges.map((badge) => (
              <StatusBadge
                key={badge}
                text={badgeLabels[badge]}
                variant={badge === 'RECOMMENDED' ? 'access' : 'muted'}
              />
            ))}
          </span>
          {plan.deliveryInterval && (
            <span className="block text-xs text-muted-foreground">
              {formatDeliveryInterval(plan.deliveryInterval)}
            </span>
          )}
          {plan.shipmentCount > 1 && (
            <span className="block text-sm text-muted-foreground">
              Заказ может приехать несколькими отправлениями
            </span>
          )}
          {plan.shipmentCount > 1 && (
            <details className="flex flex-col gap-2 text-sm">
              <summary className="cursor-pointer">Состав доставки</summary>
              <span className="flex flex-col gap-3">
                {plan.parts.map((part, index) => (
                  <span key={part.partId} className="block">
                    <strong>
                      Отправление {index + 1} из {plan.parts.length}
                    </strong>
                    <span className="block text-muted-foreground">
                      {part.items
                        .map((item) => `${item.title} × ${item.quantity}`)
                        .join(', ')}
                    </span>
                    <span className="block text-muted-foreground">
                      {part.provider.name} · {part.service.name}
                    </span>
                    {part.deliveryInterval && (
                      <span className="block text-muted-foreground">
                        {formatDeliveryInterval(part.deliveryInterval)}
                      </span>
                    )}
                  </span>
                ))}
              </span>
            </details>
          )}
          <span
            className={`block text-xs ${timeState === 'expired' ? 'text-destructive' : timeState === 'expiring' ? 'text-warning' : 'text-muted-foreground'}`}
          >
            {timeState === 'expired'
              ? 'Вариант истёк — выполните новый расчёт'
              : timeState === 'expiring'
                ? 'Вариант скоро истечёт'
                : 'Доставка до двери'}
          </span>
        </div>
      </div>
    </div>
  );

  return control ? (
    <label className={className}>{content}</label>
  ) : (
    <article className={className}>{content}</article>
  );
}
