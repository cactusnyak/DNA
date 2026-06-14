import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import type { Order } from '@/entities/order';
import { formatPrice } from '@/shared/utils/format-price';

type CheckoutSuccessStateProps = {
  order: Order;
};

export function CheckoutSuccessState({ order }: CheckoutSuccessStateProps) {
  return (
    <section className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-border bg-card p-8">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Заказ оформлен
        </p>

        <h1 className="text-2xl font-semibold">
          Спасибо, заказ принят в работу
        </h1>

        <p className="text-sm text-muted-foreground">
          Номер заказа: <span className="text-foreground">{order.id}</span>
        </p>
      </div>

      <div className="rounded-xl bg-muted/40 p-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">Сумма заказа</span>

          <span className="text-lg font-semibold">
            {formatPrice(order.totalAmount)}
          </span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Менеджер свяжется с вами по указанному телефону. Да, пока без магии
        эквайринга, зато без регистрации ради покупки. Маленькая победа здравого
        смысла.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild>
          <Link to="/catalog">Вернуться в каталог</Link>
        </Button>

        <Button asChild variant="outline">
          <Link to="/authorization">Создать профиль</Link>
        </Button>
      </div>
    </section>
  );
}