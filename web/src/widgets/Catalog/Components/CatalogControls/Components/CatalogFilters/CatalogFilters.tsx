import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/Button';
import type { Product } from '@/entities/product';

import { FilterSection } from './components/FilterSection';
import { PriceFilter } from './components/PriceFilter';
import { SubcategoryFilter } from './components/SubcategoryFilter';
import type {
  CatalogPriceFilterValue,
  CatalogSubcategoryFilterOption,
} from './types/catalog-filters';

type CatalogFiltersProps = {
  products: Product[];
};

function getPriceBounds(products: Product[]) {
  if (!products.length) {
    return {
      min: 0,
      max: 0,
    };
  }

  const prices = products.map((product) => product.price);

  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

function getSubcategoryOptions(products: Product[]) {
  const optionByCategoryId = new Map<string, CatalogSubcategoryFilterOption>();

  products.forEach((product) => {
    const currentOption = optionByCategoryId.get(product.category.id);

    if (currentOption) {
      optionByCategoryId.set(product.category.id, {
        ...currentOption,
        productsCount: currentOption.productsCount + 1,
      });

      return;
    }

    optionByCategoryId.set(product.category.id, {
      id: product.category.id,
      name: product.category.name,
      productsCount: 1,
    });
  });

  return Array.from(optionByCategoryId.values()).sort((first, second) =>
    first.name.localeCompare(second.name, 'ru'),
  );
}

export function CatalogFilters({ products }: CatalogFiltersProps) {
  const priceBounds = useMemo(() => getPriceBounds(products), [products]);
  const subcategoryOptions = useMemo(
    () => getSubcategoryOptions(products),
    [products],
  );

  const [priceFilter, setPriceFilter] = useState<CatalogPriceFilterValue>({
    from: priceBounds.min,
    to: priceBounds.max,
  });

  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<
    string[]
  >([]);

  useEffect(() => {
    setPriceFilter({
      from: priceBounds.min,
      to: priceBounds.max,
    });
  }, [priceBounds.min, priceBounds.max]);

  function handleToggleSubcategory(subcategoryId: string) {
    setSelectedSubcategoryIds((currentIds) =>
      currentIds.includes(subcategoryId)
        ? currentIds.filter((id) => id !== subcategoryId)
        : [...currentIds, subcategoryId],
    );
  }

  function handleReset() {
    setPriceFilter({
      from: priceBounds.min,
      to: priceBounds.max,
    });
    setSelectedSubcategoryIds([]);
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
          onChange={setPriceFilter}
        />
      </FilterSection>

      <FilterSection title="Подкатегории">
        <SubcategoryFilter
          options={subcategoryOptions}
          selectedIds={selectedSubcategoryIds}
          onToggle={handleToggleSubcategory}
        />
      </FilterSection>
    </aside>
  );
}