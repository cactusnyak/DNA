import { Link } from 'react-router-dom';

import type { Product } from '@/entities/product';
import { getPlatformCategoryHref } from '@/shared/platform';
import { formatPrice } from '@/shared/utils/format-price';
import { ContentDescription } from '@/components/ui/ContentDescription';

type ProductDetailsInfoProps = {
  product: Product;
};

export function ProductDetailsInfo({ product }: ProductDetailsInfoProps) {
  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-2">
        <Link
          to={getPlatformCategoryHref(
            'market',
            product.category.path ?? product.category.slug,
          )}
          className='w-fit underline-offset-4 hover:underline text-muted-foreground hover:text-foreground text-sm'
        >
          {product.category.name}
        </Link>
      </header>

      <div className="flex flex-col gap-2">
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
