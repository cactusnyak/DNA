import { Link } from 'react-router-dom';
import { Grid2X2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { getCategories } from '@/entities/category/api/get-categories';
import { Button } from '@/components/ui/button';

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

  const previewCategories = categories
    .filter((category) => !category.parentId)
    .slice(0, limit);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>

        <Button variant="outline" asChild>
          <Link to="/catalog">Все категории</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {previewCategories.map((category) => (
          <Link
            key={category.id}
            to={`/catalog/${category.slug}`}
            className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card p-4 text-center transition-colors hover:bg-muted"
          >
            <div className="flex size-12 items-center justify-center overflow-hidden rounded-lg">
              {category.image?.url ? (
                <img
                  src={category.image.url}
                  alt={category.image.alt ?? category.name}
                  className="size-7 object-contain"
                />
              ) : (
                <Grid2X2 className="size-7 text-muted-foreground" />
              )}
            </div>

            <span className="text-sm font-medium">{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}