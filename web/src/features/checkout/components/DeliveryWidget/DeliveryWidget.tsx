import { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { FormInputField } from '@/components/ui/FormField';
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

type Props = { order: Order; onOrderChange: (order: Order) => void };

const badgeLabels = {
  RECOMMENDED: 'Рекомендуем',
  CHEAPEST: 'Самая выгодная',
  FASTEST: 'Самая быстрая',
} as const;

export function DeliveryWidget({ order, onOrderChange }: Props) {
  const accessToken = useAuthStore((state) => state.accessToken) ?? undefined;
  const guestSessionId = useSessionStore((state) => state.guestSessionId);
  const credentials = useMemo(
    () => ({
      accessToken,
      guestSessionId: accessToken ? undefined : guestSessionId,
    }),
    [accessToken, guestSessionId],
  );
  const [country, setCountry] = useState(
    order.delivery.destination?.country ?? 'Россия',
  );
  const [city, setCity] = useState(order.delivery.destination?.city ?? '');
  const [fullAddress, setFullAddress] = useState(
    order.delivery.destination?.fullAddress ?? order.deliveryAddress,
  );
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState<string>();

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
      const resolved = await resolveDeliveryLocation(fullAddress);
      await updateOrderDestination(
        order.id,
        {
          ...resolved,
          country: country.trim() || resolved.country,
          city: city.trim() || resolved.city,
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
  if (!hasOrdinaryDelivery) return null;

  return (
    <section className="space-y-5 rounded-2xl bg-card p-5 shadow-card-lg sm:p-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold">Автоматическая доставка</h2>
        <p className="text-sm text-muted-foreground">
          Подтвердите адрес и выберите один вариант доставки заказа.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormInputField
          name="delivery-country"
          label="Страна"
          value={country}
          onChange={(event) => setCountry(event.target.value)}
        />
        <FormInputField
          name="delivery-city"
          label="Город"
          value={city}
          onChange={(event) => setCity(event.target.value)}
        />
        <div className="sm:col-span-2">
          <FormInputField
            name="delivery-address"
            label="Полный адрес"
            value={fullAddress}
            onChange={(event) => setFullAddress(event.target.value)}
          />
        </div>
      </div>

      <Button
        type="button"
        variant="secondary"
        disabled={pending || !fullAddress.trim()}
        onClick={() => destinationMutation.mutate()}
      >
        {destinationMutation.isPending
          ? 'Подтверждаем…'
          : order.delivery.destination
            ? 'Обновить адрес и пересчитать'
            : 'Подтвердить адрес и рассчитать'}
      </Button>

      {order.delivery.unavailableItems.map((item) => (
        <ErrorMessage key={item.orderItemId}>
          {item.title}: {item.message}
        </ErrorMessage>
      ))}

      <div className="space-y-3">
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
                <span className="min-w-0 flex-1 space-y-2">
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
                    <details className="text-sm">
                      <summary className="cursor-pointer">
                        Состав доставки
                      </summary>
                      <span className="mt-2 block space-y-3">
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

      {!order.delivery.plans.length && order.delivery.destination && (
        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={() => quoteMutation.mutate()}
        >
          {quoteMutation.isPending ? 'Рассчитываем…' : 'Повторить расчёт'}
        </Button>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {!order.delivery.readyForPayment &&
        order.delivery.blockingReasons.map((reason) => (
          <p key={reason} className="text-sm text-warning">
            {reason}
          </p>
        ))}
    </section>
  );
}
