import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { getCatalogCategories } from '@/shared/catalog';
import { getCategorySlugFromPath } from '@/shared/catalog';
import type { PlatformSectionId } from '@/shared/platform';
import { Catalog } from '@/widgets/Catalog';

type CategoryPageProps = {
  section: PlatformSectionId;
};

export function CategoryPage({ section }: CategoryPageProps) {
  const { '*': categoryPath } = useParams();
  const categorySlug = getCategorySlugFromPath(categoryPath);

  const {
    data: categories = [],
    isPending,
    error,
  } = useQuery({
    queryKey: ['categories', section],
    queryFn: () => getCatalogCategories({ section }),
  });

  const currentCategory = useMemo(() => {
    if (!categorySlug) {
      return undefined;
    }

    return categories.find((category) => category.slug === categorySlug);
  }, [categories, categorySlug]);

  if (isPending) {
    return <p className="text-muted-foreground">Загрузка категории...</p>;
  }

  if (error || !currentCategory) {
    return <p className="text-destructive">Категория не найдена</p>;
  }

  return (
    <Catalog
      section={section}
      title={currentCategory.name}
      showHeader
      showControls
      showFilters
      showSorting
    />
  );
}

