import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import type { Order } from '@/entities/order';

type OrderActionsProps = {
  order: Order;
  error?: string;
  isRebuilding: boolean;
  onContinue: () => void;
  onRepeat: () => void;
  onRemove: () => void;
};

export function OrderActions({
  order,
  error,
  isRebuilding,
  onContinue,
  onRepeat,
  onRemove,
}: OrderActionsProps) {
  return (
    <div className="flex flex-col gap-3">
      {error && <ErrorMessage role="alert">{error}</ErrorMessage>}
      <div className="flex flex-wrap gap-3">
        {order.capabilities.canContinue && (
          <Button
            type="button"
            variant="accent"
            onClick={onContinue}
            disabled={isRebuilding}
          >
            {order.status === 'AWAITING_PAYMENT'
              ? 'Перейти к оплате'
              : 'Продолжить оформление'}
          </Button>
        )}
        {!order.capabilities.canContinue && order.capabilities.canRepeat && (
          <Button
            type="button"
            variant="secondary"
            onClick={onRepeat}
            disabled={isRebuilding}
          >
            Повторить заказ
          </Button>
        )}
        {order.capabilities.canRemove && (
          <Button type="button" variant="destructive" onClick={onRemove}>
            {order.capabilities.removeAction === 'delete'
              ? 'Удалить черновик'
              : 'Отменить заказ'}
          </Button>
        )}
      </div>
    </div>
  );
}
