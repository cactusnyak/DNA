import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/entities/category/api/get-categories';
import { getProducts } from '@/entities/product/api/get-products';
import { CatalogBreadcrumbs } from './Components/CatalogBreadcrumbs';
import { CatalogControls } from './Components/CatalogControls';
import { CatalogHeader } from './Components/CatalogHeader';
import { ProductGrid } from './Components/ProductGrid';
import { getCategoryBreadcrumbs } from './logic/get-category-breadcrumbs';

type CatalogProps = {
  title?: string;
  showHeader?: boolean;
  showCatalogLink?: boolean;
  showControls?: boolean;
  showFilters?: boolean;
  showSorting?: boolean;
  showBreadcrumbs?: boolean;
};

export function Catalog({
  title = 'Каталог',
  showHeader = true,
  showCatalogLink = false,
  showControls = true,
  showFilters = true,
  showSorting = true,
  showBreadcrumbs = true,
}: CatalogProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategoryId = searchParams.get('categoryId') ?? undefined;

  function handleCategoryChange(categoryId?: string) {
    setSearchParams((currentSearchParams) => {
      const nextSearchParams = new URLSearchParams(currentSearchParams);

      if (categoryId) {
        nextSearchParams.set('categoryId', categoryId);
      } else {
        nextSearchParams.delete('categoryId');
      }

      return nextSearchParams;
    });
  }

  const {
    data: categories,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

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

  const breadcrumbs = getCategoryBreadcrumbs(
    categories ?? [],
    selectedCategoryId,
  );

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
          onCategoryChange={handleCategoryChange}
          showFilters={showFilters}
          showSorting={showSorting}
        />
      )}

      {showBreadcrumbs && (
        <CatalogBreadcrumbs
          breadcrumbs={breadcrumbs}
          onCategoryChange={handleCategoryChange}
        />
      )}

      <ProductGrid products={products ?? []} />
    </section>
  );
}