import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { getCategories } from '@/entities/category/api/get-categories';

import { CategoryPreviewGrid } from './components/CategoryPreviewGrid';
import { getPreviewCategories } from './logic/get-preview-categories';

type CategoryPreviewProps = {
  title?: string;
  limit?: number;
};

export function CategoryPreview({
  title = 'Популярные категории',
  limit = 6,
}: CategoryPreviewProps) {
  const {
    data: categories,
    isPending,
    error,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  if (isPending) {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">Загрузка категорий...</p>
      </section>
    );
  }

  if (error || !categories?.length) {
    return null;
  }

  const previewCategories = getPreviewCategories(categories, limit);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>

        <Button variant="outline" asChild>
          <Link to="/catalog">Все категории</Link>
        </Button>
      </div>

      <CategoryPreviewGrid
        categories={categories}
        previewCategories={previewCategories}
      />
    </section>
  );
}