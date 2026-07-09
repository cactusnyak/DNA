import { Link } from 'react-router-dom';

import type { Product } from '@/entities/product';
import { getPlatformCategoryHref } from '@/shared/platform';
import { formatPrice } from '@/shared/utils/format-price';

type ProductDetailsInfoProps = {
  product: Product;
};

export function ProductDetailsInfo({ product }: ProductDetailsInfoProps) {
  return (
    <div className="space-y-2">
      <Link
        to={getPlatformCategoryHref(
          'market',
          product.category.path ?? product.category.slug,
        )}
        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        {product.category.name}
      </Link>

      <h1 className="text-2xl font-semibold">{product.title}</h1>
      <p className="text-3xl font-semibold">{formatPrice(product.price)}</p>

      {product.description && (
        <p className="pt-2 text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>
      )}
    </div>
  );
}
