import { StatusBadge, type StatusBadgeVariant } from '@/components/ui/StatusBadge';
import { formatOrderStatus, type OrderStatus } from '@/entities/order';

type OrderDetailsHeaderProps = {
  id: string;
  status: OrderStatus;
  createdAt: string;
};

function getOrderStatusVariant(status: OrderStatus): StatusBadgeVariant {
  if (status === 'AWAITING_PAYMENT') return 'warning';
  if (status === 'DELIVERED' || status === 'CASHBACK_ACCRUED') return 'access';
  if (status === 'CANCELLED') return 'destructive';
  return 'default';
}

export function OrderDetailsHeader({
  id,
  status,
  createdAt,
}: OrderDetailsHeaderProps) {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold">Заказ № {id.slice(0, 8)}</h1>
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge
          text={formatOrderStatus(status)}
          variant={getOrderStatusVariant(status)}
        />
        <span aria-hidden="true" className="h-4 w-px bg-border" />
        <span className="text-sm text-muted-foreground">
          {new Date(createdAt).toLocaleString('ru-RU')}
        </span>
      </div>
    </header>
  );
}
