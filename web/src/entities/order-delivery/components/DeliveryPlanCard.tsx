import { type ReactNode, useState } from 'react';

import { getQuoteTimeState } from '../logic';
import type { DeliveryPlan } from '../types';
import { DeliveryPlanBadges } from './DeliveryPlanBadges';
import { DeliveryPlanDetails } from './DeliveryPlanDetails';
import { DeliveryPlanHeader } from './DeliveryPlanHeader';

type DeliveryPlanCardProps = {
  plan: DeliveryPlan;
  selected?: boolean;
  bordered?: boolean;
  control?: ReactNode;
  now?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
};

export function DeliveryPlanCard({
  plan,
  selected = false,
  bordered = true,
  control,
  now,
  onRefresh,
  isRefreshing = false,
}: DeliveryPlanCardProps) {
  const [renderedAt] = useState(() => Date.now());
  const timeState = getQuoteTimeState(plan.expiresAt, now ?? renderedAt);
  const providerNames = [
    ...new Map(
      plan.parts.map((part) => [part.provider.code, part.provider.name]),
    ).values(),
  ];
  const title = providerNames.length ? providerNames.join(', ') : plan.title;
  const className = [
    'block rounded-2xl p-4',
    control && 'cursor-pointer',
    bordered && 'border',
    bordered && (selected ? 'border-primary' : 'border-border/80')
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <div className="flex items-start gap-3">
      {control && <div className="flex pt-1">{control}</div>}
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <DeliveryPlanHeader
          title={title}
          customerPrice={plan.customerPrice}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <DeliveryPlanBadges
            badges={plan.badges}
            isMixedProviderPlan={providerNames.length > 1}
          />
          <DeliveryPlanDetails
            plan={plan}
            timeState={timeState}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
          />
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
