import { useMemo } from 'react';

import { Button } from '@/components/ui/Button';
import type { Product } from '@/entities/product';

import { FilterSection } from './components/FilterSection';
import { PriceFilter } from './components/PriceFilter';
import { SubcategoryFilter } from './components/SubcategoryFilter';
import { getPriceBounds } from './logic/get-price-bounds';
import { getSubcategoryOptions } from './logic/get-subcategory-options';
import { toggleSelectedCategoryId } from './logic/toggle-selected-category-id';
import type { CatalogPriceFilterValue, CatalogSubcategoryFilterOption } from './types/catalog-filters';

type CatalogFiltersProps = {
  products: { price: number }[];
  priceFilter: CatalogPriceFilterValue;
  selectedCategoryIds: string[];
  subcategoryOptions?: CatalogSubcategoryFilterOption[];
  onPriceFilterChange: (value: CatalogPriceFilterValue) => void;
  onSelectedCategoryIdsChange: (categoryIds: string[]) => void;
  oversizedFilter?: 'all' | 'oversized' | 'regular';
  onOversizedFilterChange?: (value: 'all' | 'oversized' | 'regular') => void;
};

export function CatalogFilters({
  products,
  priceFilter,
  selectedCategoryIds,
  subcategoryOptions: subcategoryOptionsProp,
  onPriceFilterChange,
  onSelectedCategoryIdsChange,
  oversizedFilter = 'all',
  onOversizedFilterChange,
}: CatalogFiltersProps) {
  const priceBounds = useMemo(() => getPriceBounds(products as Product[]), [products]);
  const subcategoryOptions = useMemo(
    () => subcategoryOptionsProp ?? getSubcategoryOptions(products as Product[]),
    [products, subcategoryOptionsProp],
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
    onOversizedFilterChange?.('all');
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
      {onOversizedFilterChange && <FilterSection title="Тип доставки"><label className="flex flex-col gap-1 text-sm"><span className="sr-only">Тип товара</span><select className="h-9 rounded-lg border border-input bg-background px-3" value={oversizedFilter} onChange={(event) => onOversizedFilterChange(event.target.value as 'all' | 'oversized' | 'regular')}><option value="all">Все товары</option><option value="oversized">Крупногабаритные</option><option value="regular">Обычные</option></select></label></FilterSection>}

      {subcategoryOptions.length > 0 && (
        <FilterSection title="Подкатегории">
          <SubcategoryFilter
            options={subcategoryOptions}
            selectedIds={selectedCategoryIds}
            onToggle={handleToggleSubcategory}
          />
        </FilterSection>
      )}
    </aside>
  );
}
