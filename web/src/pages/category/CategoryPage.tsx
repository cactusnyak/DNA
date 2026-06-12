import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { getCategories } from '@/entities/category/api/get-categories';
import { getCategorySlugFromPath } from '@/entities/category/utils/category-path';
import { Catalog } from '@/widgets/Catalog';

export function CategoryPage() {
  const { '*': categoryPath } = useParams();
  const categorySlug = getCategorySlugFromPath(categoryPath);

  const {
    data: categories = [],
    isPending,
    error,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
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
      title={currentCategory.name}
      showHeader
      showControls
      showFilters
      showSorting
    />
  );
}