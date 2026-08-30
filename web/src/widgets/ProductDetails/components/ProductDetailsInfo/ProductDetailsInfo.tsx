import { Link } from 'react-router-dom';

import type { Product } from '@/entities/product';
import { getPlatformCategoryHref } from '@/shared/platform';
import { formatPrice } from '@/shared/utils/format-price';
import { ContentDescription } from '@/components/ui/ContentDescription';
import { OversizedIndicator } from '@/components/OversizedIndicator/OversizedIndicator';
import { RewardPreview } from '@/components/RewardPreview';

type ProductDetailsInfoProps = {
  product: Product;
};

export function ProductDetailsInfo({ product }: ProductDetailsInfoProps) {
  return (
    <div className="flex flex-col gap-5">
      <header className="flex gap-2">
        <Link
          to={getPlatformCategoryHref(
            'market',
            product.category.path ?? product.category.slug,
          )}
          className="w-fit rounded-sm bg-primary/5 px-2 py-1 text-xs text-primary underline-offset-4 hover:bg-primary/10"
        >
          {product.category.name}
        </Link>
        {product.isOversized && <OversizedIndicator />}
      </header>

      <div className="flex flex-col gap-6">
        <div className='flex flex-col gap-2'>
          <h1 className="text-2xl font-semibold">{product.title}</h1>
          <p className="text-3xl font-semibold text-primary">
            {formatPrice(product.price)}
          </p>
          <RewardPreview preview={product.rewardPreview} />
        </div>
        <ContentDescription description={product.description} />
      </div>
    </div>
  );
}
