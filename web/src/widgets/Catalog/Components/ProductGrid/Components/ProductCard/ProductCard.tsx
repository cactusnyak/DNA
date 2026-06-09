import type { Product } from '@/entities/product';

import { AddToCartButton } from './components/AddToCartButton';
import { ProductCardContent } from './components/ProductCardContent';
import { ProductGallery } from './components/ProductGallery';

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