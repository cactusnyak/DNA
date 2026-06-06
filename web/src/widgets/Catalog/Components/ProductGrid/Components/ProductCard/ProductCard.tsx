import type { Product } from '@/entities/product';

import { AddToCartButton } from './Components/AddToCartButton';
import { ProductCardContent } from './Components/ProductCardContent';
import { ProductGallery } from './Components/ProductGallery';

type ProductCardProps = {
  product: Product;
  showAddToCartButton?: boolean;
};

export function ProductCard({
  product,
  showAddToCartButton = true,
}: ProductCardProps) {
  return (
    <article className="overflow-hidden bg-card">
      <ProductGallery images={product.images} title={product.title} />

      <ProductCardContent product={product} />

      {showAddToCartButton && (
        <div className="p-4 pt-0">
          <AddToCartButton productId={product.id} />
        </div>
      )}
    </article>
  );
}