import { Link } from 'react-router-dom';

import type { Order } from '@/entities/order/types/order';
import { formatPrice } from '@/shared/utils/format-price';

type OrderItemsListProps = {
  items: Order['items'];
};

export function OrderItemsList({ items }: OrderItemsListProps) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        const product = item.product;
        const image = product?.images[0];

        return (
          <Link
            key={item.id}
            to={`/market/product/${product?.slug ?? item.productId}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-lg bg-primary/3 p-2 transition-colors hover:bg-primary/5"
          >
            <span className="size-12 shrink-0 overflow-hidden rounded-md bg-muted">
              {image ? (
                <img
                  src={image.url}
                  alt={image.alt ?? product?.title ?? ''}
                  className="size-full object-cover"
                />
              ) : (
                <span className="flex size-full items-center justify-center p-1 text-center text-[10px] leading-tight text-muted-foreground">
                  Нет фото
                </span>
              )}
            </span>
            <span className="flex min-w-0 flex-col gap-1">
              <span className="font-medium">
                {product?.title ??
                  item.productTitle ??
                  `Товар ${item.productId}`}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatPrice(item.unitPrice * item.quantity)}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
