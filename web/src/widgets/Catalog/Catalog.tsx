import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getProducts } from '@/entities/product/api/get-products';

import { CatalogControls } from './Components/CatalogControls';
import { CatalogHeader } from './Components/CatalogHeader';
import { ProductGrid } from './Components/ProductGrid';

type CatalogProps = {
  title?: string;
  showHeader?: boolean;
  showCatalogLink?: boolean;
  showControls?: boolean;
  showFilters?: boolean;
  showSorting?: boolean;
};

export function Catalog({
  title = 'Каталог',
  showHeader = true,
  showCatalogLink = false,
  showControls = true,
  showFilters = true,
  showSorting = true,
}: CatalogProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>();

  const {
    data: products,
    isPending,
    error,
  } = useQuery({
    queryKey: ['products', selectedCategoryId],
    queryFn: () =>
      getProducts({
        categoryId: selectedCategoryId,
      }),
  });

  if (isPending) {
    return (
      <section className="space-y-4">
        {showHeader && (
          <CatalogHeader title={title} showCatalogLink={showCatalogLink} />
        )}

        <p className="text-muted-foreground">Загрузка товаров...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-4">
        {showHeader && (
          <CatalogHeader title={title} showCatalogLink={showCatalogLink} />
        )}

        <p className="text-destructive">Не удалось загрузить товары</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {showHeader && (
        <CatalogHeader title={title} showCatalogLink={showCatalogLink} />
      )}

      {showControls && (
        <CatalogControls
          selectedCategoryId={selectedCategoryId}
          onCategoryChange={setSelectedCategoryId}
          showFilters={showFilters}
          showSorting={showSorting}
        />
      )}

      <ProductGrid products={products ?? []} />
    </section>
  );
}