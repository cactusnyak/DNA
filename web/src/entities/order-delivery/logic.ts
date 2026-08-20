import type { DeliveryOption } from './types';

export function formatDeliveryInterval(option: DeliveryOption) {
  const interval = option.deliveryInterval;
  if (!interval) return undefined;
  const format = (value: string) => new Date(value).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' });
  return `${format(interval.from)} — ${format(interval.to)}`;
}

export function getQuoteTimeState(expiresAt: string, now = Date.now()) {
  const remaining = new Date(expiresAt).getTime() - now;
  if (remaining <= 0) return 'expired' as const;
  if (remaining <= 120_000) return 'expiring' as const;
  return 'active' as const;
}
