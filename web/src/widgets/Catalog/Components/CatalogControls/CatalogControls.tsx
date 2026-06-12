import type { Product } from '@/entities/product';

import { CatalogFilters } from './components/CatalogFilters';
import { CatalogSorting } from './components/CatalogSorting';

type CatalogControlsProps = {
  products: Product[];
  showFilters?: boolean;
  showSorting?: boolean;
};

export function CatalogControls({
  products,
  showFilters = true,
  showSorting = true,
}: CatalogControlsProps) {
  if (!showFilters && !showSorting) {
    return null;
  }

  return (
    <aside className="space-y-6 rounded-xl bg-muted/30 p-4 lg:sticky lg:top-24 lg:self-start">
      {showSorting && <CatalogSorting />}
      {showFilters && <CatalogFilters products={products} />}
    </aside>
  );
}