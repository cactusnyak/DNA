import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import type { Order } from '@/entities/order';
import { formatPrice } from '@/shared/utils/format-price';

type CheckoutPaymentStateProps = {
  order: Order;
};

export function CheckoutPaymentState({ order }: CheckoutPaymentStateProps) {
  return (
    <section className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-border bg-card p-8">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Заказ оформлен
        </p>

        <h1 className="text-2xl font-semibold">
          Осталось оплатить заказ
        </h1>

        <p className="text-sm text-muted-foreground">
          Номер заказа: <span className="text-foreground">{order.id}</span>
        </p>
      </div>

      <table className="w-full text-sm">
        <tbody>
          <tr className="border-b border-border">
            <td className="py-3 text-muted-foreground">Сумма к оплате</td>
            <td className="py-3 text-right text-lg font-semibold">
              {formatPrice(order.totalAmount)}
            </td>
          </tr>
          <tr>
            <td className="py-3 text-muted-foreground">Статус</td>
            <td className="py-3 text-right font-medium">Ожидает оплаты</td>
          </tr>
        </tbody>
      </table>

      <p className="text-sm text-muted-foreground">
        После оплаты заказ будет передан в обработку. Если оплата не будет
        совершена в течение 30 минут, заказ будет автоматически отменён.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button disabled>
          Оплатить заказ
        </Button>

        <Button asChild variant="outline">
          <Link to="/market/catalog">Вернуться в каталог</Link>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Подключение платёжной системы будет выполнено на следующем шаге.
      </p>
    </section>
  );
}
