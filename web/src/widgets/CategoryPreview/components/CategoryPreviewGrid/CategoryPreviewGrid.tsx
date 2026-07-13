import type { CatalogCategory } from '@/shared/types/catalog-category';
import type { PlatformSectionId } from '@/shared/platform';

import { CategoryPreviewCard } from '../CategoryPreviewCard';

type CategoryPreviewGridProps = {
  section: PlatformSectionId;
  categories: CatalogCategory[];
  previewCategories: CatalogCategory[];
};

const GRID_CONFIG = {
  minCols: 2,
  maxCols: 6,
  smDivider: 2,
};

function getGridCols(count: number) {
  const { minCols, maxCols, smDivider } = GRID_CONFIG;
  
  const baseCols = Math.max(minCols, Math.min(count, maxCols));
  const smCols = Math.max(minCols, Math.ceil(baseCols / smDivider));
  
  return {
    base: minCols,
    sm: smCols,
    lg: baseCols,
  };
}

const gridColsClasses: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
};

const smGridColsClasses: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
  5: 'sm:grid-cols-5',
  6: 'sm:grid-cols-6',
};

const lgGridColsClasses: Record<number, string> = {
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
};

export function CategoryPreviewGrid({
  section,
  categories,
  previewCategories,
}: CategoryPreviewGridProps) {
  const cols = getGridCols(previewCategories.length);
  
  const gridClassName = [
    'grid gap-3',
    gridColsClasses[cols.base],
    smGridColsClasses[cols.sm],
    lgGridColsClasses[cols.lg],
  ].join(' ');

  return (
    <div className={gridClassName}>
      {previewCategories.map((category) => (
        <CategoryPreviewCard
          key={category.id}
          section={section}
          category={category}
          categories={categories}
        />
      ))}
    </div>
  );
}

