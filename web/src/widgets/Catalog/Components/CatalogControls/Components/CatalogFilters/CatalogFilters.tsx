import { useMemo } from 'react';

import { Button } from '@/components/ui/Button';
import type { Product } from '@/entities/product';

import { FilterSection } from './components/FilterSection';
import { PriceFilter } from './components/PriceFilter';
import { SubcategoryFilter } from './components/SubcategoryFilter';
import { getPriceBounds } from './logic/get-price-bounds';
import { getSubcategoryOptions } from './logic/get-subcategory-options';
import { toggleSelectedCategoryId } from './logic/toggle-selected-category-id';
import type { CatalogPriceFilterValue } from './types/catalog-filters';

type CatalogFiltersProps = {
  products: Product[];
  priceFilter: CatalogPriceFilterValue;
  selectedCategoryIds: string[];
  onPriceFilterChange: (value: CatalogPriceFilterValue) => void;
  onSelectedCategoryIdsChange: (categoryIds: string[]) => void;
};

export function CatalogFilters({
  products,
  priceFilter,
  selectedCategoryIds,
  onPriceFilterChange,
  onSelectedCategoryIdsChange,
}: CatalogFiltersProps) {
  const priceBounds = useMemo(() => getPriceBounds(products), [products]);
  const subcategoryOptions = useMemo(
    () => getSubcategoryOptions(products),
    [products],
  );

  function handleToggleSubcategory(subcategoryId: string) {
    onSelectedCategoryIdsChange(
      toggleSelectedCategoryId(selectedCategoryIds, subcategoryId),
    );
  }

  function handleReset() {
    onPriceFilterChange({
      from: priceBounds.min,
      to: priceBounds.max,
    });
    onSelectedCategoryIdsChange([]);
  }

  return (
    <aside className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Фильтры</h2>

        <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
          Сбросить
        </Button>
      </div>

      <FilterSection title="Цена">
        <PriceFilter
          value={priceFilter}
          min={priceBounds.min}
          max={priceBounds.max}
          onChange={onPriceFilterChange}
        />
      </FilterSection>

      <FilterSection title="Подкатегории">
        <SubcategoryFilter
          options={subcategoryOptions}
          selectedIds={selectedCategoryIds}
          onToggle={handleToggleSubcategory}
        />
      </FilterSection>
    </aside>
  );
}