import type { Product } from '@/entities/product';

import { ProductCard } from './components/ProductCard';

type ProductGridProps = {
  products: Product[];
  currentCategorySlug?: string;
};

export function ProductGrid({
  products,
  currentCategorySlug,
}: ProductGridProps) {
  return (
    <div className="grid auto-rows-fr grid-cols-1 items-stretch gap-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          currentCategorySlug={currentCategorySlug}
        />
      ))}
    </div>
  );
}