import type { Product } from '@/entities/product';

import { AddToCartButton } from './Components/AddToCartButton';
import { ProductCardContent } from './Components/ProductCardContent';
import { ProductGallery } from './Components/ProductGallery';

type ProductCardProps = {
  product: Product;
  currentCategorySlug?: string;
  showAddToCartButton?: boolean;
};

export function ProductCard({
  product,
  currentCategorySlug,
  showAddToCartButton = true,
}: ProductCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg bg-card">
      <ProductGallery images={product.images} title={product.title} />

      <ProductCardContent
        product={product}
        currentCategorySlug={currentCategorySlug}
      />

      {showAddToCartButton && (
        <div className="mt-auto p-4 pt-0">
          <AddToCartButton productId={product.id} />
        </div>
      )}
    </article>
  );
}