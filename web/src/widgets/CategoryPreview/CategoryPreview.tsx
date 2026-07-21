import { useQuery } from '@tanstack/react-query';

import { getCatalogCategories } from '@/shared/catalog';
import {
  getPlatformCatalogHref,
  getPlatformSection,
  type PlatformSectionId,
} from '@/shared/platform';
import { SectionTitle } from '@/widgets/SectionTitle';

import { CategoryPreviewGrid } from './components/CategoryPreviewGrid';
import { getPreviewCategories } from './logic/get-preview-categories';

type CategoryPreviewProps = {
  section: PlatformSectionId;
  title?: string;
  limit?: number;
  emptyText?: string;
};

export function CategoryPreview({
  section,
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
    queryFn: () => getCatalogCategories({ section }),
  });

  const previewTitle = title ?? sectionConfig.categoryPreviewTitle;

  if (isPending) {
    return (
      <section className="space-y-4">
        <SectionTitle title={previewTitle} level={2} />
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
        <SectionTitle
          title={previewTitle}
          href={getPlatformCatalogHref(section)}
          level={2}
        />
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

