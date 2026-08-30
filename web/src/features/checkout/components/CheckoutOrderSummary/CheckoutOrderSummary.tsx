import { Link } from 'react-router-dom';

import { OversizedIndicator } from '@/components/OversizedIndicator/OversizedIndicator';
import { useCartStore, type CartStoreItem } from '@/entities/cart';
import { formatPrice } from '@/shared/utils/format-price';
import { OversizedDeliveryModal } from '@/widgets/OversizedDeliveryModal';

type CheckoutOrderSummaryProps = {
  items: CartStoreItem[];
  totalAmount: number;
};

export function CheckoutOrderSummary({
  items,
  totalAmount,
}: CheckoutOrderSummaryProps) {
  const setQuote = useCartStore((state) => state.setDeliveryQuote);

  const productsAmount = items.reduce(
    (sum, item) => sum + item.configuredUnitPrice * item.quantity,
    0,
  );

  const oversizedDeliveryAmount = items.reduce(
    (sum, item) =>
      sum +
      (item.deliveryQuote?.status === 'ACCEPTED'
        ? (item.deliveryQuote.confirmedDeliveryPrice ?? 0)
        : 0),
    0,
  );

  return (
    <aside className="flex flex-col gap-5 overflow-hidden rounded-2xl bg-page shadow-card-2xl lg:sticky lg:top-28 lg:self-start">
      <div className="flex flex-col gap-5 p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Ваш заказ</h2>

          <Link
            to="/cart"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Изменить
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {items.map((item) => {
            const image = item.product.images[0];
            const itemKey = item.configurationKey ?? item.product.id;

            const deliveryPrice =
              item.deliveryQuote?.status === 'ACCEPTED'
                ? (item.deliveryQuote.confirmedDeliveryPrice ?? 0)
                : 0;

            const itemTotal =
              item.configuredUnitPrice * item.quantity + deliveryPrice;

            return (
              <div key={itemKey} className="flex flex-col gap-3 sm:flex-row">
                <div className="aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:aspect-auto sm:size-16">
                  {image && (
                    <img
                      src={image.url}
                      alt={image.alt ?? item.product.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex flex-col gap-1">
                    <Link
                      to={`/market/product/${item.product.slug}`}
                      className="line-clamp-2 text-sm font-medium underline-offset-4 hover:underline"
                    >
                      {item.product.title}
                    </Link>

                    <p className="text-xs text-muted-foreground">
                      {item.quantity} × {formatPrice(item.configuredUnitPrice)}
                    </p>
                  </div>

                  {item.product.isOversized && (
                    <div className="flex flex-col gap-1">
                      <OversizedIndicator />

                      <OversizedDeliveryModal
                        product={item.product}
                        cartLineKey={itemKey}
                        quantity={item.quantity}
                        configuredUnitPrice={item.configuredUnitPrice}
                        initialQuote={item.deliveryQuote}
                        triggerClassName="h-auto min-h-8 w-full whitespace-normal px-3 py-2 leading-4 sm:w-fit text-xs text-left"
                        triggerLabel={
                          item.deliveryQuote?.status === 'ACCEPTED'
                            ? `Доставка: ${formatPrice(
                                item.deliveryQuote.confirmedDeliveryPrice ?? 0,
                              )}`
                            : 'Доставка не рассчитана — рассчитать'
                        }
                        onQuoteChange={(quote) => setQuote(itemKey, quote)}
                      />
                    </div>
                  )}
                </div>

                <p className="shrink-0 text-left text-sm font-semibold sm:text-right">
                  {formatPrice(itemTotal)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border/80 p-5">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">Товары</span>
          <span>{formatPrice(productsAmount)}</span>
        </div>

        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">
            Крупногабаритная доставка
          </span>
          <span>{formatPrice(oversizedDeliveryAmount)}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">Итого</span>
          <span className="text-xl font-semibold">
            {formatPrice(totalAmount)}
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          После подтверждения мы создадим заказ. Онлайн-оплата и доставка пока
          находятся в разработке.
        </p>
      </div>
    </aside>
  );
}
