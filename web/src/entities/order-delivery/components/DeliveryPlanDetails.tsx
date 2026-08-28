import { formatDeliveryInterval, getQuoteTimeState } from '../logic';
import type { DeliveryPlan } from '../types';
import { DeliveryPlanShipments } from './DeliveryPlanShipments';

type DeliveryPlanDetailsProps = {
  plan: DeliveryPlan;
  timeState: ReturnType<typeof getQuoteTimeState>;
  onRefresh?: () => void;
  isRefreshing?: boolean;
};

export function DeliveryPlanDetails({
  plan,
  timeState,
  onRefresh,
  isRefreshing = false,
}: DeliveryPlanDetailsProps) {
  const hasMultipleShipments = plan.parts.length > 1;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        {plan.deliveryInterval && (
          <div className="text-xs text-muted-foreground">
            {formatDeliveryInterval(plan.deliveryInterval)}
          </div>
        )}

        {hasMultipleShipments && (
          <div className="text-xs text-muted-foreground">
            Заказ может приехать несколькими отправлениями
          </div>
        )}
      </div>


      {hasMultipleShipments && <DeliveryPlanShipments parts={plan.parts} />}

      {timeState !== 'active' && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className={
              timeState === 'expired' ? 'text-destructive' : 'text-warning'
            }
          >
            {timeState === 'expired'
              ? isRefreshing
                ? 'Вариант истёк — выполняем новый расчёт'
                : 'Вариант истёк — требуется новый расчёт'
              : 'Вариант скоро истечёт'}
          </span>
          {timeState === 'expired' && onRefresh && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isRefreshing}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onRefresh();
              }}
            >
              <RefreshCw className={isRefreshing ? 'animate-spin' : undefined} />
              {isRefreshing ? 'Обновляем…' : 'Обновить'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
import { RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/Button';
