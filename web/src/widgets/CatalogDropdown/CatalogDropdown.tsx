import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getAds } from '@/entities/ad';
import { getCatalogCategories } from '@/shared/catalog';
import { getProducts } from '@/entities/product/api/get-products';
import {
  PLATFORM_SECTION,
  getPlatformSection,
  type PlatformSectionId,
} from '@/shared/platform';

import { CatalogDropdownProducts } from './components/CatalogDropdownProducts';
import { CatalogDropdownTree } from './components/CatalogDropdownTree';

type CatalogDropdownProps = {
  section: PlatformSectionId;
  onClose?: () => void;
};

export function CatalogDropdown({ section, onClose }: CatalogDropdownProps) {
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>();
  const sectionConfig = getPlatformSection(section);
  const isMarketSection = section === PLATFORM_SECTION.MARKET;
  const isAdsSection = section === PLATFORM_SECTION.ADS;

  const {
    data: categories,
    isPending: isCategoriesPending,
    error: categoriesError,
  } = useQuery({
    queryKey: ['categories', section],
    queryFn: () => getCatalogCategories({ section }),
  });

  const activeCategory = categories?.find(
    (category) => category.slug === activeCategorySlug,
  );

  const {
    data: products,
    isPending: isProductsPending,
  } = useQuery({
    queryKey: ['products', section, activeCategorySlug],
    queryFn: () =>
      getProducts({
        section,
        categorySlug: activeCategorySlug,
      }),
    enabled: isMarketSection,
  });

  const {
    data: ads,
    isPending: isAdsPending,
  } = useQuery({
    queryKey: ['ads', { categorySlug: activeCategorySlug ?? null }],
    queryFn: () => getAds({ categorySlug: activeCategorySlug }),
    enabled: isAdsSection,
  });

  return (
    <div className="mt-2 h-[70vh] w-full overflow-hidden rounded-lg border border-border bg-background shadow-lg">
      <div className="grid h-full min-w-0 grid-cols-[minmax(360px,auto)_minmax(220px,1fr)] overflow-hidden">
        <div className="min-w-0 overflow-hidden border-r border-border p-4">
          <p className="mb-3 text-sm font-semibold">
            {sectionConfig.catalogLabel}
          </p>

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
              section={section}
              categories={categories}
              activeCategorySlug={activeCategorySlug}
              onActiveCategoryChange={setActiveCategorySlug}
              onCategoryClick={onClose}
            />
          )}

          {!isCategoriesPending && !categoriesError && !categories?.length && (
            <p className="text-sm text-muted-foreground">
              Категории пока не добавлены.
            </p>
          )}
        </div>

        <CatalogDropdownProducts
          section={section}
          products={products ?? []}
          ads={ads ?? []}
          activeCategoryName={activeCategory?.name}
          isPending={(isMarketSection && isProductsPending) || (isAdsSection && isAdsPending)}
          onProductClick={onClose}
        />
      </div>
    </div>
  );
}

