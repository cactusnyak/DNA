import { Link } from 'react-router-dom';

import type { Product } from '@/entities/product';
import { getPlatformCategoryHref } from '@/shared/platform';
import { formatPrice } from '@/shared/utils/format-price';
import { LinkifyText } from '@/shared/utils/linkify';

type ProductDetailsInfoProps = {
  product: Product;
};

const categoryBadgeClass =
  'inline-flex items-center rounded-sm bg-muted px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground';

export function ProductDetailsInfo({ product }: ProductDetailsInfoProps) {
  return (
    <div className="space-y-2">
      <Link
        to={getPlatformCategoryHref(
          'market',
          product.category.path ?? product.category.slug,
        )}
        className={categoryBadgeClass}
      >
        {product.category.name}
      </Link>

      <h1 className="text-2xl font-semibold">{product.title}</h1>
      <p className="text-3xl font-semibold">{formatPrice(product.price)}</p>

      {product.description && (
        <p className="whitespace-pre-line pt-2 text-sm leading-relaxed text-muted-foreground">
          <LinkifyText text={product.description} />
        </p>
      )}
    </div>
  );
}
