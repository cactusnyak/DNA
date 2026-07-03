import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { getCategories } from '@/entities/category/api/get-categories';
import { getCategorySlugFromPath } from '@/entities/category/utils/category-path';
import {
  DEFAULT_PLATFORM_SECTION_ID,
  type PlatformSectionId,
} from '@/shared/platform';
import { Catalog } from '@/widgets/Catalog';

type CategoryPageProps = {
  section?: PlatformSectionId;
};

export function CategoryPage({
  section = DEFAULT_PLATFORM_SECTION_ID,
}: CategoryPageProps) {
  const { '*': categoryPath } = useParams();
  const categorySlug = getCategorySlugFromPath(categoryPath);

  const {
    data: categories = [],
    isPending,
    error,
  } = useQuery({
    queryKey: ['categories', section],
    queryFn: () => getCategories({ section }),
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
