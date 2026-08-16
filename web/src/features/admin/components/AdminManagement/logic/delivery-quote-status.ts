import type { StatusBadgeVariant } from '@/components/ui/StatusBadge';
import type { DeliveryQuoteStatus } from '@/entities/delivery-quote';

export const DELIVERY_QUOTE_STATUS_VARIANTS: Record<
  DeliveryQuoteStatus,
  { label: string; variant: StatusBadgeVariant }
> = {
  PENDING: { label: 'Ожидает расчёта', variant: 'warning' },
  QUOTED: { label: 'Расчёт готов', variant: 'default' },
  ACCEPTED: { label: 'Принято', variant: 'access' },
  EXPIRED: { label: 'Срок истёк', variant: 'dangerous' },
  CANCELLED: { label: 'Отменено', variant: 'destructive' },
};
