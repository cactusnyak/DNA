import type { Product } from '@/entities/product';

import { CatalogFilters } from './components/CatalogFilters';
import type { CatalogPriceFilterValue } from './components/CatalogFilters/types/catalog-filters';
import { CatalogSorting } from './components/CatalogSorting';
import type { CatalogSortRule } from './components/CatalogSorting/types/catalog-sorting';

type CatalogControlsProps = {
  products: Product[];
  priceFilter: CatalogPriceFilterValue;
  selectedCategoryIds: string[];
  sortRules: CatalogSortRule[];
  showFilters?: boolean;
  showSorting?: boolean;
  onPriceFilterChange: (value: CatalogPriceFilterValue) => void;
  onSelectedCategoryIdsChange: (categoryIds: string[]) => void;
  onSortRulesChange: (rules: CatalogSortRule[]) => void;
};

export function CatalogControls({
  products,
  priceFilter,
  selectedCategoryIds,
  sortRules,
  showFilters = true,
  showSorting = true,
  onPriceFilterChange,
  onSelectedCategoryIdsChange,
  onSortRulesChange,
}: CatalogControlsProps) {
  if (!showFilters && !showSorting) {
    return null;
  }

  return (
    <aside className="space-y-6 rounded-xl bg-muted/30 p-4 lg:sticky lg:top-24 lg:self-start">
      {showSorting && (
        <CatalogSorting value={sortRules} onChange={onSortRulesChange} />
      )}

      {showFilters && (
        <CatalogFilters
          products={products}
          priceFilter={priceFilter}
          selectedCategoryIds={selectedCategoryIds}
          onPriceFilterChange={onPriceFilterChange}
          onSelectedCategoryIdsChange={onSelectedCategoryIdsChange}
        />
      )}
    </aside>
  );
}