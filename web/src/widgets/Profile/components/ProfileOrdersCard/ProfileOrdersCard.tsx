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

function ProfileOrdersMessage({
  tone = 'muted',
  children,
}: {
  tone?: 'muted' | 'destructive';
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5 rounded-xl border border-border px-4 py-4">
      <p
        className={[
          'text-sm leading-6',
          tone === 'destructive'
            ? 'text-destructive'
            : 'text-muted-foreground',
        ].join(' ')}
      >
        {children}
      </p>
    </div>
  );
}

export function ProfileOrdersCard({
  orders,
  isPending = false,
  isError = false,
}: ProfileOrdersCardProps) {
  if (isPending) {
    return (
      <section>
        <h2 className="text-lg font-semibold">Мои заказы</h2>

        <ProfileOrdersMessage>
          Загружаем заказы...
        </ProfileOrdersMessage>
      </section>
    );
  }

  if (isError) {
    return (
      <section>
        <h2 className="text-lg font-semibold">Мои заказы</h2>

        <ProfileOrdersMessage tone="destructive">
          Не удалось загрузить историю заказов.
        </ProfileOrdersMessage>
      </section>
    );
  }

  if (!orders.length) {
    return (
      <section>
        <h2 className="text-lg font-semibold">Мои заказы</h2>

        <div className="mt-5 rounded-xl border border-border px-4 py-4">
          <p className="text-sm leading-6 text-muted-foreground">
            Заказов пока нет. Каталог уже ждёт, как кассир в пустом магазине.
          </p>

          <Link
            to="/market/catalog"
            className="mt-4 inline-flex text-sm font-medium underline-offset-4 hover:underline"
          >
            Перейти в каталог
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
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

      <div className="mt-5 overflow-hidden rounded-xl border border-border">
        {orders.map((order) => (
          <article
            key={order.id}
            className="border-b border-border px-4 py-4 last:border-b-0"
          >
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
              <div>
                <p className="text-sm font-semibold">
                  Заказ № {order.id.slice(0, 8)}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {formatOrderDate(order.createdAt)} · {getOrderItemsLabel(order)}
                </p>
              </div>

              <div className="sm:text-right">
                <p className="text-sm font-semibold">
                  {formatPrice(order.totalAmount)}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {formatOrderStatus(order.status)}
                </p>
              </div>
            </div>

            <div className="mt-3 grid gap-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-1 text-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-3"
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