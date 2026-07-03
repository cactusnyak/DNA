import type { Product } from '@/entities/product';
import type { PlatformSectionId } from '@/shared/platform';
import { cn } from '@/shared/utils/cn';

import { ProductCard } from './components/ProductCard';

type ProductGridProps = {
  section: PlatformSectionId;
  products: Product[];
  currentCategorySlug?: string;
  compact?: boolean;
};

export function ProductGrid({
  section,
  products,
  currentCategorySlug,
  compact = false,
}: ProductGridProps) {
  return (
    <div
      className={cn(
        'grid auto-rows-fr grid-cols-1 items-stretch gap-4 sm:grid-cols-2',
        compact ? 'xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4',
      )}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          section={section}
          product={product}
          currentCategorySlug={currentCategorySlug}
        />
      ))}
    </div>
  );
}
