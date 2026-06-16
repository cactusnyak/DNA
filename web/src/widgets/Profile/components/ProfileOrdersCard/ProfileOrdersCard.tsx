import { Link } from 'react-router-dom';

import {
  formatOrderStatus,
  type Order,
} from '@/entities/order';
import { formatPrice } from '@/shared/utils/format-price';

type ProfileOrdersCardProps = {
  orders: Order[];
  isPending?: boolean;
  isError?: boolean;
};

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function formatOrderDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function getOrderItemsLabel(order: Order) {
  const totalQuantity = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  if (totalQuantity === 1) {
    return '1 товар';
  }

  if (totalQuantity > 1 && totalQuantity < 5) {
    return `${totalQuantity} товара`;
  }

  return `${totalQuantity} товаров`;
}

export function ProfileOrdersCard({
  orders,
  isPending = false,
  isError = false,
}: ProfileOrdersCardProps) {
  if (isPending) {
    return (
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">Мои заказы</h2>

        <p className="mt-4 text-sm text-muted-foreground">
          Загружаем заказы...
        </p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">Мои заказы</h2>

        <p className="mt-4 text-sm text-destructive">
          Не удалось загрузить историю заказов.
        </p>
      </section>
    );
  }

  if (!orders.length) {
    return (
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">Мои заказы</h2>

        <p className="mt-4 text-sm text-muted-foreground">
          Заказов пока нет. Каталог уже ждёт, как кассир в пустом магазине.
        </p>

        <Link
          to="/catalog"
          className="mt-4 inline-flex text-sm font-medium underline-offset-4 hover:underline"
        >
          Перейти в каталог
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Мои заказы</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            История заказов, оформленных после входа в профиль.
          </p>
        </div>

        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
          {orders.length}
        </span>
      </div>

      <div className="mt-5 divide-y divide-border">
        {orders.map((order) => (
          <article key={order.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">
                  Заказ № {order.id.slice(0, 8)}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {formatOrderDate(order.createdAt)} · {getOrderItemsLabel(order)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold">
                  {formatPrice(order.totalAmount)}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {formatOrderStatus(order.status)}
                </p>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="line-clamp-1 text-muted-foreground">
                    {item.product?.title ?? `Товар ${item.productId}`}
                  </span>

                  <span className="shrink-0 text-muted-foreground">
                    {item.quantity} × {formatPrice(item.unitPrice)}
                  </span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}