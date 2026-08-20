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
  updateOrderDeliverySelections,
  updateOrderDestination,
} from '@/entities/order-delivery';
import { getOrder, type Order } from '@/entities/order';
import { useSessionStore } from '@/entities/session';
import { formatPrice } from '@/shared/utils/format-price';

type Props = { order: Order; onOrderChange: (order: Order) => void };

export function DeliveryWidget({ order, onOrderChange }: Props) {
  const accessToken = useAuthStore((state) => state.accessToken) ?? undefined;
  const guestSessionId = useSessionStore((state) => state.guestSessionId);
  const credentials = useMemo(() => ({ accessToken, guestSessionId: accessToken ? undefined : guestSessionId }), [accessToken, guestSessionId]);
  const [country, setCountry] = useState(order.delivery.destination?.country ?? 'Россия');
  const [city, setCity] = useState(order.delivery.destination?.city ?? '');
  const [fullAddress, setFullAddress] = useState(order.delivery.destination?.fullAddress ?? order.deliveryAddress);
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState<string>();

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const refresh = async () => {
    const next = await getOrder(order.id, accessToken, accessToken ? undefined : guestSessionId);
    onOrderChange(next);
    return next;
  };

  const destinationMutation = useMutation({
    mutationFn: async () => {
      const resolved = await resolveDeliveryLocation(fullAddress);
      await updateOrderDestination(order.id, {
        ...resolved,
        country: country.trim() || resolved.country,
        city: city.trim() || resolved.city,
        recipientName: order.customerName,
        recipientPhone: order.customerPhone,
        recipientEmail: order.customerEmail,
      }, credentials);
      await calculateOrderDelivery(order.id, credentials);
      return refresh();
    },
    onSuccess: () => setError(undefined),
    onError: () => setError('Не удалось подтвердить адрес и рассчитать доставку.'),
  });

  const quoteMutation = useMutation({
    mutationFn: async () => {
      await calculateOrderDelivery(order.id, credentials);
      return refresh();
    },
    onSuccess: () => setError(undefined),
    onError: () => setError('Не удалось рассчитать доставку. Попробуйте ещё раз.'),
  });

  const selectionMutation = useMutation({
    mutationFn: async ({ groupKey, quoteId }: { groupKey: string; quoteId: string }) => {
      const selections = order.delivery.groups.flatMap((group) => {
        const selected = group.groupKey === groupKey ? quoteId : group.selectedQuote?.quoteId;
        return selected ? [{ groupKey: group.groupKey, quoteId: selected }] : [];
      });
      await updateOrderDeliverySelections(order.id, {
        selections,
        pricingVersion: order.delivery.pricing.version,
      }, credentials);
      return refresh();
    },
    onSuccess: () => setError(undefined),
    onError: () => {
      setError('Не удалось сохранить выбор. Состояние заказа обновлено.');
      void refresh();
    },
  });

  const pending = destinationMutation.isPending || quoteMutation.isPending || selectionMutation.isPending;
  const ordinaryGroups = order.delivery.groups;
  if (!ordinaryGroups.length && !order.delivery.unavailableItems.length) return null;

  return (
    <section className="space-y-5 rounded-2xl bg-card p-5 shadow-card-lg sm:p-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold">Доставка</h2>
        <p className="text-sm text-muted-foreground">Подтвердите адрес и выберите вариант для каждого отправления.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormInputField name="delivery-country" label="Страна" value={country} onChange={(event) => setCountry(event.target.value)} />
        <FormInputField name="delivery-city" label="Город" value={city} onChange={(event) => setCity(event.target.value)} />
        <div className="sm:col-span-2">
          <FormInputField name="delivery-address" label="Полный адрес" value={fullAddress} onChange={(event) => setFullAddress(event.target.value)} />
        </div>
      </div>

      <Button
        type="button"
        variant="secondary"
        disabled={pending || !fullAddress.trim()}
        onClick={() => destinationMutation.mutate()}
      >
        {destinationMutation.isPending ? 'Подтверждаем…' : order.delivery.destination ? 'Обновить адрес и пересчитать' : 'Подтвердить адрес и рассчитать'}
      </Button>

      {order.delivery.unavailableItems.map((item) => (
        <ErrorMessage key={item.orderItemId}>{item.title}: {item.message}</ErrorMessage>
      ))}

      {ordinaryGroups.map((group, index) => (
        <article key={group.groupKey} className="space-y-4 rounded-2xl border border-border/80 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-medium">Отправление {index + 1}</h3>
              <p className="text-xs text-muted-foreground">{group.items.map((item) => `${item.title} × ${item.quantity}`).join(', ')}</p>
            </div>
            <StatusBadge
              text={group.selectedQuote ? 'Выбрано' : group.providers.some((provider) => provider.options.length) ? 'Нужен выбор' : 'Нужен расчёт'}
              variant={group.selectedQuote ? 'access' : 'warning'}
            />
          </div>

          {group.providers.map((provider) => (
            <div key={provider.code} className="space-y-2">
              <div className="text-sm font-medium">{provider.name}</div>
              {provider.unavailableReason && <p className="text-sm text-destructive">{provider.unavailableReason.message}</p>}
              {provider.options.map((option) => {
                const timeState = getQuoteTimeState(option.expiresAt, now);
                const selected = group.selectedQuote?.quoteId === option.quoteId;
                const interval = formatDeliveryInterval(option);
                return (
                  <label key={option.quoteId} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${selected ? 'border-primary bg-primary/5' : 'border-border/80'}`}>
                    <input
                      type="radio"
                      name={`delivery-${group.groupKey}`}
                      checked={selected}
                      disabled={pending || timeState === 'expired' || option.fulfillmentType === 'PICKUP'}
                      onChange={() => selectionMutation.mutate({ groupKey: group.groupKey, quoteId: option.quoteId })}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-3">
                        <span className="font-medium">{option.title}</span>
                        <span className="font-semibold">{formatPrice(option.customerPrice)}</span>
                      </span>
                      {option.description && <span className="mt-1 block text-xs text-muted-foreground">{option.description}</span>}
                      {interval && <span className="mt-1 block text-xs text-muted-foreground">{interval}</span>}
                      <span className={`mt-1 block text-xs ${timeState === 'expired' ? 'text-destructive' : timeState === 'expiring' ? 'text-warning' : 'text-muted-foreground'}`}>
                        {timeState === 'expired' ? 'Предложение истекло' : timeState === 'expiring' ? 'Предложение скоро истечёт' : 'Доставка до двери'}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          ))}

          {!group.providers.some((provider) => provider.options.length) && (
            <Button type="button" variant="secondary" disabled={pending || !order.delivery.destination} onClick={() => quoteMutation.mutate()}>
              {quoteMutation.isPending ? 'Рассчитываем…' : 'Повторить расчёт'}
            </Button>
          )}
        </article>
      ))}

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {!order.delivery.readyForPayment && order.delivery.blockingReasons.map((reason) => <p key={reason} className="text-sm text-warning">{reason}</p>)}
    </section>
  );
}
