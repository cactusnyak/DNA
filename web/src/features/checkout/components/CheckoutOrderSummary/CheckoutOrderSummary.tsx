import { Link } from 'react-router-dom';

import type { CartStoreItem } from '@/entities/cart';
import { formatPrice } from '@/shared/utils/format-price';

type CheckoutOrderSummaryProps = {
  items: CartStoreItem[];
  totalAmount: number;
};

export function CheckoutOrderSummary({
  items,
  totalAmount,
}: CheckoutOrderSummaryProps) {
  return (
    <aside className="rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-28 lg:self-start">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Ваш заказ</h2>

        <Link
          to="/cart"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Изменить
        </Link>
      </div>

      <div className="mt-5 space-y-4">
        {items.map((item) => {
          const image = item.product.images[0];
          const itemTotal = item.product.price * item.quantity;

          return (
            <div key={item.product.id} className="flex gap-3">
              <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                {image && (
                  <img
                    src={image.url}
                    alt={image.alt ?? item.product.title}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <Link
                  to={`/market/product/${item.product.slug}`}
                  className="line-clamp-2 text-sm font-medium underline-offset-4 hover:underline"
                >
                  {item.product.title}
                </Link>

                <p className="mt-1 text-xs text-muted-foreground">
                  {item.quantity} × {formatPrice(item.product.price)}
                </p>
              </div>

              <p className="shrink-0 text-sm font-semibold">
                {formatPrice(itemTotal)}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 border-t border-border pt-5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">Итого</span>

          <span className="text-xl font-semibold">
            {formatPrice(totalAmount)}
          </span>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          После подтверждения заказа вы перейдёте к оплате. Заказ будет оформлен
          после успешного платежа.
        </p>
      </div>
    </aside>
  );
}