import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getCategories } from '@/entities/category/api/get-categories';
import { getProducts } from '@/entities/product/api/get-products';

import { CatalogDropdownTree } from './Components/CatalogDropdownTree';

export function CatalogDropdown() {
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>();

  const {
    data: categories,
    isPending: isCategoriesPending,
    error: categoriesError,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const {
    data: products,
    isPending: isProductsPending,
  } = useQuery({
    queryKey: ['products', activeCategorySlug],
    queryFn: () =>
      getProducts({
        categorySlug: activeCategorySlug,
      }),
    enabled: Boolean(activeCategorySlug),
  });

  return (
    <div className="max-h-[70vh] overflow-hidden rounded-lg border border-border bg-background shadow-lg">
      <div className="mx-auto grid max-h-[70vh] max-w-7xl grid-cols-[minmax(0,1fr)_320px] overflow-hidden px-4 py-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="overflow-x-auto overflow-y-hidden">
          {isCategoriesPending && (
            <p className="p-4 text-sm text-muted-foreground">
              Загрузка категорий...
            </p>
          )}

          {categoriesError && (
            <p className="p-4 text-sm text-destructive">
              Не удалось загрузить категории
            </p>
          )}

          {!!categories?.length && (
            <CatalogDropdownTree
              categories={categories}
              activeCategorySlug={activeCategorySlug}
              onActiveCategoryChange={setActiveCategorySlug}
            />
          )}
        </div>

        <aside className="border-l border-border pl-4">
          <p className="mb-3 text-sm font-medium">Товары категории</p>

          {!activeCategorySlug && (
            <p className="text-sm text-muted-foreground">
              Наведите на категорию, чтобы увидеть товары.
            </p>
          )}

          {activeCategorySlug && isProductsPending && (
            <p className="text-sm text-muted-foreground">
              Загрузка товаров...
            </p>
          )}

          {activeCategorySlug && !isProductsPending && !products?.length && (
            <p className="text-sm text-muted-foreground">
              В категории пока нет товаров.
            </p>
          )}

          {!!products?.length && (
            <div className="grid grid-cols-2 gap-3">
              {products.slice(0, 6).map((product) => {
                const image = product.images[0];

                return (
                  <a
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="group overflow-hidden rounded-lg border border-border bg-card"
                  >
                    <div className="aspect-square bg-muted">
                      {image && (
                        <img
                          src={image.url}
                          alt={image.alt ?? product.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      )}
                    </div>

                    <div className="space-y-1 p-2">
                      <p className="line-clamp-2 text-xs font-medium">
                        {product.title}
                      </p>

                      <p className="text-xs text-muted-foreground group-hover:text-foreground">
                        К товару
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}