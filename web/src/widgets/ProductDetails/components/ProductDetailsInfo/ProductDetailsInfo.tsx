import { Link } from 'react-router-dom';

import type { Product } from '@/entities/product';
import { getPlatformCategoryHref } from '@/shared/platform';
import { formatPrice } from '@/shared/utils/format-price';
import { ContentDescription } from '@/components/ui/ContentDescription';

type ProductDetailsInfoProps = {
  product: Product;
};

const categoryBadgeClass =
  'inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground w-fit';

export function ProductDetailsInfo({ product }: ProductDetailsInfoProps) {
  return (
    <div className="flex flex-col gap-2">
      <header className="flex flex-col gap-2">
        <div className='px-3 py-2.5 bg-primary/10 w-fit rounded-tl-3xl rounded-br-3xl'>
          <Link
            to={getPlatformCategoryHref(
              'market',
              product.category.path ?? product.category.slug,
            )}
            className={categoryBadgeClass}
          >
            {product.category.name}
          </Link>
        </div>
      </header>

      <div className="flex flex-col gap-2 px-5 py-2">
        <div>
          <h1 className="text-2xl font-semibold">{product.title}</h1>
          <p className="text-3xl font-semibold">
            {formatPrice(product.price)}
          </p>
        </div>
        <ContentDescription description={product.description} />
      </div>
    </div>
  );
}
