import { Link } from 'react-router-dom';

import type { Product } from '@/entities/product';
import { getPlatformCategoryHref } from '@/shared/platform';
import { formatPrice } from '@/shared/utils/format-price';
import { ContentDescription } from '@/components/ui/ContentDescription';

type ProductDetailsInfoProps = {
  product: Product;
};

const categoryBadgeClass =
  'inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground';

export function ProductDetailsInfo({ product }: ProductDetailsInfoProps) {
  return (
    <div className="space-y-2">
      <header className="space-y-2">
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
      </header>

      <div className="space-y-2">
        <p className="text-3xl font-semibold">{formatPrice(product.price)}</p>
        <ContentDescription description={product.description} />
      </div>
    </div>
  );
}
