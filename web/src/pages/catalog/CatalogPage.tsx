import { useQuery } from '@tanstack/react-query';

import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { getCatalogCategories } from '@/shared/catalog';
import {
  getPlatformSection,
  type PlatformSectionId,
} from '@/shared/platform';
import { CatalogCategoryTree } from '@/widgets/CatalogCategoryTree';

type CatalogPageProps = {
  section: PlatformSectionId;
};

export function CatalogPage({ section }: CatalogPageProps) {
  const sectionConfig = getPlatformSection(section);

  const {
    data: categories = [],
    isPending,
    error,
  } = useQuery({
    queryKey: ['categories', section],
    queryFn: () => getCatalogCategories({ section }),
  });

  if (isPending) {
    return (
      <SkeletonLoader
        layout="stack"
        count={5}
        itemClassName="min-h-16"
        ariaLabel="Загружаем категории"
      />
    );
  }

  if (error) {
    return <p className="text-destructive">Не удалось загрузить категории</p>;
  }

  return (
    <CatalogCategoryTree
      categories={categories}
      section={section}
      title={sectionConfig.catalogLabel}
      description={sectionConfig.catalogDescription}
      emptyText="Здесь пока нет категорий."
    />
  );
}
