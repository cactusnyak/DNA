import { Link } from 'react-router-dom';

import type { Product } from '@/entities/product';

type ProductCardContentProps = {
  product: Product;
  currentCategorySlug?: string;
};

export function ProductCardContent({
  product,
  currentCategorySlug,
}: ProductCardContentProps) {
  const shouldShowCategoryLink =
    currentCategorySlug &&
    currentCategorySlug !== product.category.slug;

  return (
    <div className="flex flex-1 flex-col space-y-3 p-4">
      <div className="space-y-1">
        {shouldShowCategoryLink && (
          <Link
            to={`/catalog/${product.category.slug}`}
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            В категорию «{product.category.name}»
          </Link>
        )}

        <h3 className="line-clamp-2 font-medium">{product.title}</h3>
      </div>

      <p className="line-clamp-3 text-sm text-muted-foreground">
        {product.description}
      </p>

      <p className="mt-auto text-lg font-semibold">{product.price} ₽</p>
    </div>
  );
}