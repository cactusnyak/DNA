import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { getCategories } from '@/entities/category/api/get-categories';
import {
  DEFAULT_PLATFORM_SECTION_ID,
  getPlatformCatalogHref,
  getPlatformSection,
  type PlatformSectionId,
} from '@/shared/platform';

import { CategoryPreviewGrid } from './components/CategoryPreviewGrid';
import { getPreviewCategories } from './logic/get-preview-categories';

type CategoryPreviewProps = {
  section?: PlatformSectionId;
  title?: string;
  limit?: number;
  emptyText?: string;
};

export function CategoryPreview({
  section = DEFAULT_PLATFORM_SECTION_ID,
  title,
  limit = 6,
  emptyText = 'Категории не найдены.',
}: CategoryPreviewProps) {
  const sectionConfig = getPlatformSection(section);

  const {
    data: categories,
    isPending,
    error,
  } = useQuery({
    queryKey: ['categories', section],
    queryFn: () => getCategories({ section }),
  });

  const previewTitle = title ?? sectionConfig.categoryPreviewTitle;

  if (isPending) {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{previewTitle}</h2>
        <p className="text-sm text-muted-foreground">Загрузка категорий...</p>
      </section>
    );
  }

  if (error) {
    return null;
  }

  const previewCategories = getPreviewCategories(categories ?? [], limit);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">{previewTitle}</h2>

        <Button variant="outline" asChild>
          <Link to={getPlatformCatalogHref(section)}>Все категории</Link>
        </Button>
      </div>

      {previewCategories.length ? (
        <CategoryPreviewGrid
          section={section}
          categories={categories ?? []}
          previewCategories={previewCategories}
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-sm text-muted-foreground">
          {emptyText}
        </div>
      )}
    </section>
  );
}
