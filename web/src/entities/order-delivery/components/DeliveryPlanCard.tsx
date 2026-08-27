import { type ReactNode, useState } from 'react';

import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatPrice } from '@/shared/utils/format-price';

import { formatDeliveryInterval, getQuoteTimeState } from '../logic';
import type { DeliveryPlan } from '../types';
import { DeliveryPlanShipments } from './DeliveryPlanShipments';

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
  const providerNames = [
    ...new Map(
      plan.parts.map((part) => [part.provider.code, part.provider.name]),
    ).values(),
  ];
  const isMixedProviderPlan = providerNames.length > 1;
  const hasMultipleShipments = plan.parts.length > 1;
  const title = providerNames.length ? providerNames.join(', ') : plan.title;
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
          <span className="font-medium">{title}</span>
          <span className="font-semibold text-primary">{formatPrice(plan.customerPrice)}</span>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <span className="flex flex-wrap gap-2">
            {isMixedProviderPlan && (
              <StatusBadge text="Смешанный" variant="warning" />
            )}
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
          {hasMultipleShipments && (
            <span className="block text-sm text-muted-foreground">
              Заказ может приехать несколькими отправлениями
            </span>
          )}
          {hasMultipleShipments && (
            <DeliveryPlanShipments parts={plan.parts} />
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
