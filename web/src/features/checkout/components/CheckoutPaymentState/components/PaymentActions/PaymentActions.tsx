import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';

type PaymentActionsProps = {
  isPending: boolean;
  isRetry: boolean;
  onPay: () => void;
};

export function PaymentActions({
  isPending,
  isRetry,
  onPay,
}: PaymentActionsProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button
        variant="accent"
        onClick={onPay}
        disabled={isPending}
      >
        {isPending
          ? 'Открываем оплату...'
          : isRetry
            ? 'Попробовать оплатить снова'
            : 'Оплатить заказ'}
      </Button>

      <Button asChild variant="secondary">
        <Link to="/market/catalog">Вернуться в каталог</Link>
      </Button>
    </div>
  );
}
