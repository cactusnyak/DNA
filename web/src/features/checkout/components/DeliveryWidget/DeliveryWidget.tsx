import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { FormRadioField } from '@/components/ui/FormField';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { useAuthStore } from '@/entities/auth';
import {
  calculateOrderDelivery,
  DeliveryPlanCard,
  getQuoteTimeState,
  resolveDeliveryLocation,
  updateOrderDeliveryPlan,
  updateOrderDestination,
} from '@/entities/order-delivery';
import { getOrder, type Order } from '@/entities/order';
import { useSessionStore } from '@/entities/session';

type Props = {
  order: Order;
  onOrderChange: (order: Order) => void;
};

export function DeliveryWidget({
  order,
  onOrderChange,
}: Props) {
  const accessToken = useAuthStore((state) => state.accessToken) ?? undefined;
  const guestSessionId = useSessionStore((state) => state.guestSessionId);
  const credentials = useMemo(
    () => ({
      accessToken,
      guestSessionId: accessToken ? undefined : guestSessionId,
    }),
    [accessToken, guestSessionId],
  );
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState<string>();
  const automaticRequestRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const refresh = async () => {
    const next = await getOrder(
      order.id,
      accessToken,
      accessToken ? undefined : guestSessionId,
    );
    onOrderChange(next);
    return next;
  };

  const destinationMutation = useMutation({
    mutationFn: async () => {
      const resolved = await resolveDeliveryLocation(order.deliveryAddress);
      await updateOrderDestination(
        order.id,
        {
          country: resolved.country,
          city: resolved.city,
          fullAddress: resolved.fullAddress,
          latitude: resolved.latitude,
          longitude: resolved.longitude,
          externalLocationId: resolved.externalLocationId,
          recipientName: order.customerName,
          recipientPhone: order.customerPhone,
          recipientEmail: order.customerEmail,
        },
        credentials,
      );
      await calculateOrderDelivery(order.id, credentials);
      return refresh();
    },
    onSuccess: () => setError(undefined),
    onError: () =>
      setError('Не удалось подтвердить адрес и рассчитать доставку.'),
  });

  const quoteMutation = useMutation({
    mutationFn: async () => {
      await calculateOrderDelivery(order.id, credentials);
      return refresh();
    },
    onSuccess: () => setError(undefined),
    onError: () =>
      setError('Не удалось рассчитать доставку. Попробуйте ещё раз.'),
  });

  const selectionMutation = useMutation({
    mutationFn: async (planId: string) => {
      const delivery = await updateOrderDeliveryPlan(
        order.id,
        {
          planId,
          pricingVersion: order.delivery.pricing.version,
        },
        credentials,
      );
      onOrderChange({
        ...order,
        delivery,
        totalAmount: delivery.pricing.totalAmount,
      });
      return delivery;
    },
    onSuccess: () => setError(undefined),
    onError: () => {
      setError('Не удалось сохранить выбранный вариант доставки.');
    },
  });

  const pending =
    destinationMutation.isPending ||
    quoteMutation.isPending ||
    selectionMutation.isPending;
  const hasOrdinaryDelivery = order.items.some((item) => !item.isOversized);

  useEffect(() => {
    if (
      !hasOrdinaryDelivery ||
      order.delivery.plans.length > 0 ||
      pending ||
      destinationMutation.isError ||
      quoteMutation.isError
    ) {
      return;
    }

    const action = order.delivery.destination ? 'quote' : 'destination';
    const requestKey = `${order.id}:${action}`;
    if (automaticRequestRef.current === requestKey) return;

    if (action === 'quote' && order.delivery.status !== 'READY_FOR_QUOTE') {
      return;
    }
    if (action === 'destination' && !order.deliveryAddress.trim()) return;

    automaticRequestRef.current = requestKey;
    if (action === 'destination') destinationMutation.mutate();
    else quoteMutation.mutate();
  }, [
    destinationMutation,
    hasOrdinaryDelivery,
    order.delivery.destination,
    order.delivery.plans.length,
    order.delivery.status,
    order.deliveryAddress,
    order.id,
    pending,
    quoteMutation,
  ]);

  if (!hasOrdinaryDelivery) return null;

  return (
    <section className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-card-lg sm:p-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">Доставка</h2>
        <p className="text-sm text-muted-foreground">
          Выберите вариант доставки заказа.
        </p>
      </header>

      {order.delivery.plans.length === 0 &&
        (destinationMutation.isPending || quoteMutation.isPending) && (
          <p className="text-sm text-muted-foreground">
            Подтверждаем адрес и рассчитываем варианты доставки…
          </p>
        )}

      {order.delivery.unavailableItems.map((item) => (
        <ErrorMessage key={item.orderItemId}>
          {item.title}: {item.message}
        </ErrorMessage>
      ))}

      {order.delivery.plans.length > 0 && selectionMutation.isPending && (
        <SkeletonLoader
          layout="stack"
          count={order.delivery.plans.length}
          itemClassName="min-h-32"
          ariaLabel="Сохраняем выбранный вариант доставки"
        />
      )}

      {order.delivery.plans.length > 0 && !selectionMutation.isPending && (
        <div className="flex flex-col gap-3">
          {order.delivery.plans.map((plan) => {
            const selected = order.delivery.selectedPlanId === plan.planId;
            const timeState = getQuoteTimeState(plan.expiresAt, now);
            return (
              <DeliveryPlanCard
                key={plan.planId}
                plan={plan}
                selected={selected}
                now={now}
                control={
                    <FormRadioField
                      name="delivery-plan"
                      value={plan.planId}
                      checked={selected}
                      disabled={
                        selectionMutation.isPending || timeState === 'expired'
                      }
                      ariaLabel={`Выбрать вариант доставки «${plan.title}»`}
                      onCheckedChange={() => selectionMutation.mutate(plan.planId)}
                    />
                }
              />
            );
          })}
        </div>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}
    </section>
  );
}
