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
      <div>
        <h3 className="line-clamp-2 font-medium">{product.title}</h3>

        {shouldShowCategoryLink && (
          <Link
            to={`/catalog/${product.category.slug}`}
            className="mt-0.5 block text-xs text-muted-foreground/70 underline-offset-2 hover:text-foreground"
          >
            В категорию «{product.category.name}»
          </Link>
        )}
      </div>

      <p className="line-clamp-3 text-sm text-muted-foreground">
        {product.description}
      </p>

      <p className="mt-auto text-lg font-semibold">{product.price} ₽</p>
    </div>
  );
}