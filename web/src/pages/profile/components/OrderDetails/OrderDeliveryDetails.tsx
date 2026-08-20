import type { Order } from '@/entities/order';
import { DeliveryPlanCard } from '@/entities/order-delivery';

type OrderDeliveryDetailsProps = {
  delivery: Order['delivery'];
};

export function OrderDeliveryDetails({ delivery }: OrderDeliveryDetailsProps) {
  const plan = delivery.plans.find(
    (candidate) => candidate.planId === delivery.selectedPlanId,
  );

  if (!plan) return null;

  return <DeliveryPlanCard plan={plan} selected bordered={false} />;
}
