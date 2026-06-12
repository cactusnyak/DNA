import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { getProducts } from '@/entities/product/api/get-products';
import { getCategorySlugFromPath } from '@/entities/category/utils/category-path';

import { CatalogControls } from './components/CatalogControls';
import { CatalogHeader } from './components/CatalogHeader';
import { ProductGrid } from './components/ProductGrid';

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
  const { '*': categoryPath } = useParams();
  const categorySlug = getCategorySlugFromPath(categoryPath);

  const {
    data: products = [],
    isPending,
    error,
  } = useQuery({
    queryKey: ['products', categorySlug],
    queryFn: () =>
      getProducts({
        categorySlug,
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
    <section className="space-y-8">
      {showHeader && (
        <CatalogHeader title={title} showCatalogLink={showCatalogLink} />
      )}

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        {showControls && (
          <CatalogControls
            products={products}
            showFilters={showFilters}
            showSorting={showSorting}
          />
        )}

        <ProductGrid products={products} currentCategorySlug={categorySlug} />
      </div>
    </section>
  );
}