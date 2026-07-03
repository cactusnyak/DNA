import { Link } from 'react-router-dom';

import type { Product } from '@/entities/product';
import {
  getPlatformCategoryHref,
  type PlatformSectionId,
} from '@/shared/platform';
import { formatPrice } from '@/shared/utils/format-price';

type ProductCardContentProps = {
  section: PlatformSectionId;
  product: Product;
  currentCategorySlug?: string;
};

export function ProductCardContent({
  section,
  product,
  currentCategorySlug,
}: ProductCardContentProps) {
  const categoryHref = getPlatformCategoryHref(section, product.category.path);
  const shouldShowCategoryLink =
    currentCategorySlug && currentCategorySlug !== product.category.slug;

  return (
    <div className="flex flex-1 flex-col p-4">
      <p className="text-xl font-bold">{formatPrice(product.price)}</p>

      <div className="mt-2">
        <h3 className="line-clamp-2 font-semibold">{product.title}</h3>

        {shouldShowCategoryLink && (
          <Link
            to={categoryHref}
            className="mt-0.5 block text-xs text-muted-foreground/70 underline-offset-2 hover:text-foreground"
          >
            В категорию «{product.category.name}»
          </Link>
        )}
      </div>

      <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">
        {product.description}
      </p>
    </div>
  );
}
