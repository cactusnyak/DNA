import { ChevronDown } from 'lucide-react';
import { type RefObject, useRef, useState } from 'react';

import { Button } from '@/components/ui/Button';
import type { CatalogSubcategoryFilterOption } from './components/CatalogFilters/types/catalog-filters';
import { cn } from '@/shared/utils/cn';

import { useStickyPanel } from './logic/use-sticky-panel';

import { CatalogFilters } from './components/CatalogFilters';
import type { CatalogPriceFilterValue } from './components/CatalogFilters/types/catalog-filters';
import { CatalogSorting } from './components/CatalogSorting';
import type { CatalogSortRule } from './components/CatalogSorting/types/catalog-sorting';

type CatalogControlsProps = {
  products: { price: number }[];
  priceFilter: CatalogPriceFilterValue;
  selectedCategoryIds: string[];
  sortRules: CatalogSortRule[];
  showFilters?: boolean;
  showSorting?: boolean;
  subcategoryOptions?: CatalogSubcategoryFilterOption[];
  containerRef?: RefObject<HTMLDivElement | null>;
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
  subcategoryOptions,
  containerRef,
  onPriceFilterChange,
  onSelectedCategoryIdsChange,
  onSortRulesChange,
}: CatalogControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useStickyPanel({ sentinelRef, panelRef, containerRef });

  if (!showFilters && !showSorting) {
    return null;
  }

  return (
    <div ref={sentinelRef} className="lg:self-start">
      <aside ref={panelRef} className="rounded-xl bg-background/60 backdrop-blur-xl">
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
              subcategoryOptions={subcategoryOptions}
              onPriceFilterChange={onPriceFilterChange}
              onSelectedCategoryIdsChange={onSelectedCategoryIdsChange}
            />
          )}
        </div>
      </aside>
    </div>
  );
}