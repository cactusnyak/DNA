import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getCategories } from '@/entities/category/api/get-categories';
import { getProducts } from '@/entities/product/api/get-products';

import { CatalogDropdownProducts } from './components/CatalogDropdownProducts';
import { CatalogDropdownTree } from './components/CatalogDropdownTree';

type CatalogDropdownProps = {
  onClose?: () => void;
};

export function CatalogDropdown({ onClose }: CatalogDropdownProps) {
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>();

  const {
    data: categories,
    isPending: isCategoriesPending,
    error: categoriesError,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const activeCategory = categories?.find(
    (category) => category.slug === activeCategorySlug,
  );

  const {
    data: products,
    isPending: isProductsPending,
  } = useQuery({
    queryKey: ['products', activeCategorySlug],
    queryFn: () =>
      getProducts({
        categorySlug: activeCategorySlug,
      }),
  });

  return (
    <div className="mt-2 h-[70vh] w-full overflow-hidden rounded-lg border border-border bg-background shadow-lg">
      <div className="grid h-full min-w-0 grid-cols-[minmax(360px,auto)_minmax(220px,1fr)] overflow-hidden">
        <div className="min-w-0 overflow-hidden border-r border-border p-4">
          {isCategoriesPending && (
            <p className="text-sm text-muted-foreground">
              Загрузка категорий...
            </p>
          )}

          {categoriesError && (
            <p className="text-sm text-destructive">
              Не удалось загрузить категории
            </p>
          )}

          {!!categories?.length && (
            <CatalogDropdownTree
              categories={categories}
              activeCategorySlug={activeCategorySlug}
              onActiveCategoryChange={setActiveCategorySlug}
              onCategoryClick={onClose}
            />
          )}
        </div>

        <CatalogDropdownProducts
          products={products ?? []}
          activeCategoryName={activeCategory?.name}
          isPending={isProductsPending}
          onProductClick={onClose}
        />
      </div>
    </div>
  );
}