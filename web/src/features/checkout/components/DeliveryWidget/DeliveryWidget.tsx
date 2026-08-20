import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuthStore } from '@/entities/auth';
import {
  calculateOrderDelivery,
  formatDeliveryInterval,
  getQuoteTimeState,
  resolveDeliveryLocation,
  updateOrderDeliveryPlan,
  updateOrderDestination,
} from '@/entities/order-delivery';
import { getOrder, type Order } from '@/entities/order';
import { useSessionStore } from '@/entities/session';
import { formatPrice } from '@/shared/utils/format-price';

type Props = {
  order: Order;
  onOrderChange: (order: Order) => void;
};

const badgeLabels = {
  RECOMMENDED: 'Рекомендуем',
  CHEAPEST: 'Самая выгодная',
  FASTEST: 'Самая быстрая',
} as const;

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
          ...resolved,
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
      await updateOrderDeliveryPlan(
        order.id,
        {
          planId,
          pricingVersion: order.delivery.pricing.version,
        },
        credentials,
      );
      return refresh();
    },
    onSuccess: () => setError(undefined),
    onError: () => {
      setError('Не удалось сохранить выбор. Состояние заказа обновлено.');
      void refresh();
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

      {(destinationMutation.isPending || quoteMutation.isPending) && (
        <p className="text-sm text-muted-foreground">
          Подтверждаем адрес и рассчитываем варианты доставки…
        </p>
      )}

      {order.delivery.unavailableItems.map((item) => (
        <ErrorMessage key={item.orderItemId}>
          {item.title}: {item.message}
        </ErrorMessage>
      ))}

      {order.delivery.plans.length > 0 && (
        <div className="flex flex-col gap-3">
          {order.delivery.plans.map((plan) => {
            const selected = order.delivery.selectedPlanId === plan.planId;
            const timeState = getQuoteTimeState(plan.expiresAt, now);
            return (
              <label
                key={plan.planId}
                className={`block cursor-pointer rounded-2xl border p-4 ${selected ? 'border-primary bg-primary/5' : 'border-border/80'}`}
              >
                <span className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="delivery-plan"
                    checked={selected}
                    disabled={pending || timeState === 'expired'}
                    onChange={() => selectionMutation.mutate(plan.planId)}
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-2">
                    <span className="flex flex-wrap items-start justify-between gap-3">
                      <span className="font-medium">{plan.title}</span>
                      <span className="font-semibold">
                        {formatPrice(plan.customerPrice)}
                      </span>
                    </span>
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
                        <summary className="cursor-pointer">
                          Состав доставки
                        </summary>
                        <span className="flex flex-col gap-3">
                          {plan.parts.map((part, index) => (
                            <span key={part.partId} className="block">
                              <strong>
                                Отправление {index + 1} из {plan.parts.length}
                              </strong>
                              <span className="block text-muted-foreground">
                                {part.items
                                  .map(
                                    (item) => `${item.title} × ${item.quantity}`,
                                  )
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
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}
    </section>
  );
}
