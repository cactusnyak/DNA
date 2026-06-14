import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import type { CartStoreItem } from '@/entities/cart';
import { formatPrice } from '@/shared/utils/format-price';
import { ProductQuantityCounter } from '@/widgets/ProductQuantityCounter';

import { calculateCartItemTotal } from '../../logic/calculate-cart-item-total';

type CartItemCardProps = {
  item: CartStoreItem;
  onRemove: (productId: string) => void;
};

export function CartItemCard({ item, onRemove }: CartItemCardProps) {
  const { product, quantity } = item;

  const image = product.images[0];
  const categoryHref = `/catalog/${product.category.path ?? product.category.slug}`;
  const itemTotal = calculateCartItemTotal(item);

  return (
    <article className="grid gap-4 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[120px_minmax(0,1fr)]">
      <Link
        to={`/product/${product.id}`}
        className="block overflow-hidden rounded-xl bg-muted"
      >
        {image ? (
          <img
            src={image.url}
            alt={image.alt ?? product.title}
            className="aspect-square w-full object-cover"
          />
        ) : (
          <div className="flex aspect-square items-center justify-center text-sm text-muted-foreground">
            Нет изображения
          </div>
        )}
      </Link>

      <div className="min-w-0 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <Link
              to={`/product/${product.id}`}
              className="line-clamp-2 font-semibold underline-offset-4 hover:underline"
            >
              {product.title}
            </Link>

            <Link
              to={categoryHref}
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {product.category.name}
            </Link>
          </div>

          <div className="shrink-0 text-left sm:text-right">
            <p className="text-lg font-semibold">{formatPrice(itemTotal)}</p>

            <p className="text-xs text-muted-foreground">
              {quantity} × {formatPrice(product.price)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:w-40">
            <ProductQuantityCounter productId={product.id} variant="details" />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="justify-start text-muted-foreground hover:text-destructive sm:justify-center"
            onClick={() => onRemove(product.id)}
          >
            <Trash2 className="size-4" />
            Удалить
          </Button>
        </div>
      </div>
    </article>
  );
}