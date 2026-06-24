import { Link } from 'react-router-dom';

import type { Product } from '@/entities/product';
import { formatPrice } from '@/shared/utils/format-price';

type GlobalSearchProductRowProps = {
  product: Product;
  onNavigate: () => void;
};

export function GlobalSearchProductRow({
  product,
  onNavigate,
}: GlobalSearchProductRowProps) {
  const image = product.images[0];

  return (
    <Link
      to={`/product/${product.id}`}
      onClick={onNavigate}
      className="grid grid-cols-[56px_minmax(0,1fr)] gap-3 rounded-lg p-2 transition-colors hover:bg-muted/25"
    >
      <div className="size-14 overflow-hidden rounded-lg bg-muted">
        {image ? (
          <img
            src={image.url}
            alt={image.alt ?? product.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
            Нет фото
          </div>
        )}
      </div>

      <div className="min-w-0 p-1">
        <p className="line-clamp-2 text-sm font-medium leading-5">
          {product.title}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-semibold">
            {formatPrice(product.price)}
          </span>

          <span className="text-xs text-muted-foreground">
            {product.category.name}
          </span>
        </div>
      </div>
    </Link>
  );
}