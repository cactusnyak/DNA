import { formatDeliveryInterval, getQuoteTimeState } from '../logic';
import type { DeliveryPlan } from '../types';
import { DeliveryPlanShipments } from './DeliveryPlanShipments';

type DeliveryPlanDetailsProps = {
  plan: DeliveryPlan;
  timeState: ReturnType<typeof getQuoteTimeState>;
};

export function DeliveryPlanDetails({ plan, timeState }: DeliveryPlanDetailsProps) {
  const hasMultipleShipments = plan.parts.length > 1;

  return (
    <div className="flex flex-col gap-2">
      <div className='flex flex-col gap-2'>
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


      {hasMultipleShipments && (
        <DeliveryPlanShipments parts={plan.parts} />
      )}

      {timeState !== 'active' && (
        <div
          className={`text-xs ${timeState === 'expired' ? 'text-destructive' : 'text-warning'}`}
        >
          {timeState === 'expired'
            ? 'Вариант истёк — выполните новый расчёт'
            : 'Вариант скоро истечёт'}
        </div>
      )}
    </div>
  );
}
