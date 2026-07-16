import type { Product } from '@/entities/product';
import type { PlatformSectionId } from '@/shared/platform';
import { cn } from '@/shared/utils/cn';
import { getItemGridClasses } from '@/shared/utils/get-item-grid-classes';

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
        'auto-rows-fr items-stretch',
        getItemGridClasses(compact ? 'compact' : 'default'),
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
