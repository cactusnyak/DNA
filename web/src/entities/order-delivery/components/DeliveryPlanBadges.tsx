import { StatusBadge } from '@/components/ui/StatusBadge';

import type { DeliveryPlan } from '../types';

type DeliveryPlanBadgesProps = {
  badges: DeliveryPlan['badges'];
  isMixedProviderPlan: boolean;
};

const badgeLabels = {
  RECOMMENDED: 'Рекомендуем',
  CHEAPEST: 'Самая выгодная',
  FASTEST: 'Самая быстрая',
} as const;

export function DeliveryPlanBadges({ badges, isMixedProviderPlan }: DeliveryPlanBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {isMixedProviderPlan && (
        <StatusBadge text="Смешанный" variant="warning" />
      )}
      <StatusBadge text="Доставка до двери" variant="muted" />
      {badges.map((badge) => (
        <StatusBadge
          key={badge}
          text={badgeLabels[badge]}
          variant={badge === 'RECOMMENDED' ? 'access' : 'muted'}
        />
      ))}
    </div>
  );
}
