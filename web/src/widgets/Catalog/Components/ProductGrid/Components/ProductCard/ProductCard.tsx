import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/entities/cart';
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
  const addItem = useCartStore((state) => state.addItem);

  function handleBuyNow() {
    addItem(product);
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden p-2 rounded-2xl bg-card transition-colors hover:bg-muted/40">
      <Link
        to={`/product/${product.id}`}
        aria-label={`Открыть товар ${product.title}`}
        className="absolute inset-0 z-10"
      />

      <div className="relative z-0">
        <ProductGallery images={product.images} title={product.title} />
      </div>

      <div className="relative z-0">
        <ProductCardContent
          product={product}
          currentCategorySlug={currentCategorySlug}
        />
      </div>

      {showAddToCartButton && (
        <div className="relative z-20 mt-auto space-y-2 p-4 pt-0">
          <AddToCartButton product={product} />

          <Button type="button" className="w-full" onClick={handleBuyNow}>
            Купить в 1 клик
          </Button>
        </div>
      )}
    </article>
  );
}