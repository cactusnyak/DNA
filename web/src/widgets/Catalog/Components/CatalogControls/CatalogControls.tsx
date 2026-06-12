import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import type { Product } from '@/entities/product';
import { cn } from '@/shared/utils/cn';

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
  const [isOpen, setIsOpen] = useState(false);

  if (!showFilters && !showSorting) {
    return null;
  }

  return (
    <aside className="rounded-xl bg-muted/30 lg:sticky lg:top-24 lg:self-start">
      <div className="lg:hidden">
        <Button
          type="button"
          variant="ghost"
          className="flex h-auto w-full justify-between px-4 py-3"
          onClick={() => setIsOpen((currentValue) => !currentValue)}
        >
          Фильтры и сортировка

          <ChevronDown
            className={cn(
              'size-4 transition-transform',
              isOpen && 'rotate-180',
            )}
          />
        </Button>
      </div>

      <div
        className={cn(
          'space-y-6 p-4 pt-0',
          isOpen && 'mt-3',
          !isOpen && 'hidden',
          'lg:mt-0 lg:block lg:pt-4',
        )}
      >
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
      </div>
    </aside>
  );
}