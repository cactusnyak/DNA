import type { DeliveryQuoteStatus } from '@/entities/delivery-quote';

export const ADMIN_DELIVERY_QUOTES_QUERY_KEY = ['admin-delivery-quotes'] as const;
export const EMPTY_ADMIN_QUOTE_DRAFT = { price: '', comment: '', expiresAt: '' } as const;

export const DELIVERY_QUOTE_STATUS_VARIANTS: Record<DeliveryQuoteStatus, { label: string; className: string }> = {
  PENDING: { label: 'Ожидает расчёта', className: 'bg-warning/5 text-warning' },
  QUOTED: { label: 'Расчёт готов', className: 'bg-primary/5 text-primary' },
  ACCEPTED: { label: 'Принято', className: 'bg-success/5 text-success' },
  EXPIRED: { label: 'Срок истёк', className: 'bg-dangerous/5 text-dangerous' },
  CANCELLED: { label: 'Отменено', className: 'bg-destructive/5 text-destructive' },
};
