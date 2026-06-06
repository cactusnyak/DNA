import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getCategories } from '@/entities/category/api/get-categories';
import { getProducts } from '@/entities/product/api/get-products';

import { CatalogDropdownTree } from './Components/CatalogDropdownTree';

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
    <div className="mt-2 h-[70vh] overflow-hidden rounded-lg border border-border bg-background shadow-lg">
      <div className="grid h-full grid-cols-[auto_minmax(0,1fr)] overflow-hidden">
        <div className="max-w-[560px] overflow-auto border-r border-border p-4">
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

        <aside className="min-w-0 overflow-auto p-4">
          <p className="mb-3 text-sm font-medium">
            {activeCategory
              ? `Товары категории «${activeCategory.name}»`
              : 'Все товары'}
          </p>

          {isProductsPending && (
            <p className="text-sm text-muted-foreground">
              Загрузка товаров...
            </p>
          )}

          {!isProductsPending && !products?.length && (
            <p className="text-sm text-muted-foreground">
              Товары не найдены.
            </p>
          )}

          {!!products?.length && (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
              {products.slice(0, 8).map((product) => {
                const image = product.images[0];

                return (
                  <a
                    key={product.id}
                    href={`/product/${product.id}`}
                    onClick={onClose}
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