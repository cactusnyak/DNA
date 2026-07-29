import { useMemo, useRef, useState } from 'react';

import type { FeedItem } from '@/entities/feed';
import { EmptyPlaceholder } from '@/components/ui/EmptyPlaceholder';
import { CombinedItemsGrid } from '@/widgets/CombinedFeed';
import { CatalogControls } from '@/widgets/Catalog/components/CatalogControls';
import type { CatalogPriceFilterValue } from '@/widgets/Catalog/components/CatalogControls/components/CatalogFilters/types/catalog-filters';
import type { CatalogSortRule } from '@/widgets/Catalog/components/CatalogControls/components/CatalogSorting/types/catalog-sorting';

import {
  feedItemMatchesQuery,
  getFeedItemCategory,
  getFeedItemEntity,
} from '../logic/search-feed-items';

type SearchListingsProps = {
  items: FeedItem[];
  query: string;
};

export function SearchListings({ items, query }: SearchListingsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const matchingItems = useMemo(
    () => items.filter((item) => feedItemMatchesQuery(item, query)),
    [items, query],
  );
  const prices = matchingItems.map((item) => getFeedItemEntity(item).price);
  const initialPriceFilter = {
    from: prices.length ? Math.min(...prices) : 0,
    to: prices.length ? Math.max(...prices) : 0,
  };
  const [priceFilter, setPriceFilter] =
    useState<CatalogPriceFilterValue>(initialPriceFilter);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [sortRules, setSortRules] = useState<CatalogSortRule[]>([]);

  const categoryOptions = useMemo(() => {
    const categories = new Map<
      string,
      { id: string; name: string; productsCount: number }
    >();

    matchingItems.forEach((item) => {
      const category = getFeedItemCategory(item);
      if (!category) return;

      const current = categories.get(category.id);
      categories.set(category.id, {
        id: category.id,
        name: category.name,
        productsCount: (current?.productsCount ?? 0) + 1,
      });
    });

    return Array.from(categories.values()).sort((first, second) =>
      first.name.localeCompare(second.name, 'ru'),
    );
  }, [matchingItems]);

  const visibleItems = useMemo(() => {
    const filteredItems = matchingItems.filter((item) => {
      const entity = getFeedItemEntity(item);
      const category = getFeedItemCategory(item);

      return (
        entity.price >= priceFilter.from &&
        entity.price <= priceFilter.to &&
        (!selectedCategoryIds.length ||
          (category && selectedCategoryIds.includes(category.id)))
      );
    });

    return [...filteredItems].sort((first, second) => {
      for (const rule of sortRules) {
        const firstEntity = getFeedItemEntity(first);
        const secondEntity = getFeedItemEntity(second);
        const firstValue =
          rule.field === 'category'
            ? getFeedItemCategory(first)?.name ?? ''
            : firstEntity[rule.field];
        const secondValue =
          rule.field === 'category'
            ? getFeedItemCategory(second)?.name ?? ''
            : secondEntity[rule.field];
        const comparison = String(firstValue).localeCompare(
          String(secondValue),
          'ru',
          { numeric: true },
        );

        if (comparison !== 0) {
          return rule.direction === 'desc' ? -comparison : comparison;
        }
      }

      return 0;
    });
  }, [matchingItems, priceFilter, selectedCategoryIds, sortRules]);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-xl font-semibold">Товары и объявления</h2>
        <span className="text-sm text-muted-foreground">
          Найдено: {visibleItems.length}
        </span>
      </div>

      <div
        ref={containerRef}
        className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]"
      >
        <CatalogControls
          products={matchingItems.map((item) => ({
            price: getFeedItemEntity(item).price,
          }))}
          priceFilter={priceFilter}
          selectedCategoryIds={selectedCategoryIds}
          sortRules={sortRules}
          subcategoryOptions={categoryOptions}
          containerRef={containerRef}
          onPriceFilterChange={setPriceFilter}
          onSelectedCategoryIdsChange={setSelectedCategoryIds}
          onSortRulesChange={setSortRules}
        />

        {visibleItems.length ? (
          <CombinedItemsGrid items={visibleItems} compact />
        ) : (
          <EmptyPlaceholder>
            По вашему запросу ничего не найдено.
          </EmptyPlaceholder>
        )}
      </div>
    </section>
  );
}
