import type { Order } from '@/entities/order';
import { formatDeliveryInterval } from '@/entities/order-delivery';
import { formatPrice } from '@/shared/utils/format-price';

type OrderDeliveryDetailsProps = {
  delivery: Order['delivery'];
};

export function OrderDeliveryDetails({ delivery }: OrderDeliveryDetailsProps) {
  const plan = delivery.plans.find(
    (candidate) => candidate.planId === delivery.selectedPlanId,
  );

  if (!plan) return null;

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border/80 p-4">
      <div className="flex justify-between gap-3">
        <strong>{plan.title}</strong>
        <span>{formatPrice(plan.customerPrice)}</span>
      </div>
      <p className="text-sm text-muted-foreground">
        {plan.shipmentCount > 1
          ? `Ожидается отправлений: ${plan.shipmentCount}`
          : 'Одно отправление'}
      </p>
      {plan.parts.map((part) => (
        <div key={part.partId} className="text-sm">
          <p>
            {part.provider.name} · {part.service.name}
          </p>
          <p className="text-muted-foreground">
            {part.items
              .map((item) => `${item.title} × ${item.quantity}`)
              .join(', ')}
          </p>
          {part.deliveryInterval && (
            <p className="text-muted-foreground">
              {formatDeliveryInterval(part.deliveryInterval)}
            </p>
          )}
        </div>
      ))}
      <p className="text-xs text-muted-foreground">
        {delivery.readyForPayment
          ? 'Доставка актуальна, заказ готов к оплате.'
          : delivery.blockingReasons[0] ?? 'Требуется обновить доставку.'}
      </p>
    </section>
  );
}
