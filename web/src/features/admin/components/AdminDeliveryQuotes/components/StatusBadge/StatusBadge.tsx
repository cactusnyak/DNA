import type { DeliveryQuoteStatus } from '@/entities/delivery-quote';
import { DELIVERY_QUOTE_STATUS_VARIANTS } from '../../data/admin-delivery-quotes';

export function StatusBadge({ status }: { status: DeliveryQuoteStatus }) {
  const config = DELIVERY_QUOTE_STATUS_VARIANTS[status];
  return <span className={`w-fit rounded-sm px-2 py-1 text-xs underline-offset-4 transition-colors ${config.className}`}>{config.label}</span>;
}
