import type { StatusBadgeVariant } from '@/components/ui/StatusBadge';
import type { AdStatus } from '@/entities/ad';
import type { OrderStatus } from '@/entities/order';

export function getAdminRecordStatusVariant(record: {
  isActive?: boolean;
  deletedAt?: string | null;
}): StatusBadgeVariant {
  if (record.deletedAt) return 'destructive';
  return record.isActive === false ? 'warning' : 'access';
}

export function getOrderStatusVariant(status: OrderStatus): StatusBadgeVariant {
  if (status === 'CANCELLED') return 'destructive';
  if (status === 'AWAITING_PAYMENT') return 'warning';
  if (status === 'DELIVERED' || status === 'CASHBACK_ACCRUED') return 'access';
  return 'default';
}

export function getAdStatusVariant(status: AdStatus): StatusBadgeVariant {
  if (status === 'REJECTED') return 'destructive';
  if (status === 'PENDING_MODERATION') return 'warning';
  if (status === 'PUBLISHED') return 'access';
  if (status === 'ARCHIVED') return 'muted';
  return 'default';
}
