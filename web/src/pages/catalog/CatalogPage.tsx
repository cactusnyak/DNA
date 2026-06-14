import { useQuery } from '@tanstack/react-query';

import { getCategories } from '@/entities/category/api/get-categories';
import { CatalogCategoryTree } from '@/widgets/CatalogCategoryTree';

export function CatalogPage() {
  const {
    data: categories = [],
    isPending,
    error,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  if (isPending) {
    return <p className="text-muted-foreground">Загрузка категорий...</p>;
  }

  if (error || !categories.length) {
    return <p className="text-destructive">Не удалось загрузить категории</p>;
  }

  return <CatalogCategoryTree categories={categories} />;
}