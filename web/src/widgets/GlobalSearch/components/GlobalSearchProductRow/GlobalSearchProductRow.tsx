import { Link } from 'react-router-dom';

import type { Product } from '@/entities/product';
import { getPlatformProductHref } from '@/shared/platform';
import { formatPrice } from '@/shared/utils/format-price';
import { MarkHighlight } from '@/widgets/MarkHighlight';

type GlobalSearchProductRowProps = {
  product: Product;
  searchValue: string;
  onNavigate: () => void;
};

export function GlobalSearchProductRow({
  product,
  searchValue,
  onNavigate,
}: GlobalSearchProductRowProps) {
  const image = product.images[0];

  return (
    <Link
      to={getPlatformProductHref(product.slug)}
      onClick={onNavigate}
      className="grid grid-cols-[56px_minmax(0,1fr)] gap-3 rounded-xl p-2 transition-colors hover:bg-muted"
    >
      <div className="size-14 overflow-hidden rounded-md bg-muted">
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
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 text-sm font-medium leading-5">
            <MarkHighlight text={product.title} searchValue={searchValue} level={1} />
          </p>
          <span className="shrink-0 rounded-md bg-muted px-1.5 py-1 text-[10px] font-medium leading-none text-muted-foreground">
            Маркет
          </span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-semibold">
            {formatPrice(product.price)}
          </span>

          <span className="text-xs text-muted-foreground">
            <MarkHighlight text={product.category.name} searchValue={searchValue} level={2} />
          </span>
        </div>
      </div>
    </Link>
  );
}
