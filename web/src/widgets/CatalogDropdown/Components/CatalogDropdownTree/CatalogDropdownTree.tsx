import type { Category } from '@/entities/category';
import type { PlatformSectionId } from '@/shared/platform';

import { CategoryColumn } from './components/CategoryColumn';
import { CollapsedAncestors } from './components/CollapsedAncestors';
import { getActiveCategoryPath } from './logic/get-active-category-path';
import { getCategoryLevels } from './logic/get-category-levels';
import { getVisibleCategoryLevels } from './logic/get-visible-category-levels';

type CatalogDropdownTreeProps = {
  section: PlatformSectionId;
  categories: Category[];
  activeCategorySlug?: string;
  onActiveCategoryChange: (categorySlug?: string) => void;
  onCategoryClick?: () => void;
};

export function CatalogDropdownTree({
  section,
  categories,
  activeCategorySlug,
  onActiveCategoryChange,
  onCategoryClick,
}: CatalogDropdownTreeProps) {
  const activeCategoryPath = getActiveCategoryPath(
    categories,
    activeCategorySlug,
  );

  const levels = getCategoryLevels(categories, activeCategoryPath);

  const { hiddenLevels, visibleLevels } = getVisibleCategoryLevels(levels);

  return (
    <div className="flex h-full min-h-0 max-w-full overflow-hidden">
      <CollapsedAncestors
        section={section}
        categories={categories}
        activeCategoryPath={activeCategoryPath}
        hiddenLevelsCount={hiddenLevels.length}
        onActiveCategoryChange={onActiveCategoryChange}
        onCategoryClick={onCategoryClick}
      />

      <div className="flex min-w-0 overflow-hidden">
        {visibleLevels.map((level) => (
          <CategoryColumn
            key={`${level.level}-${level.parentId ?? 'root'}`}
            section={section}
            categories={categories}
            level={level}
            activeCategoryPath={activeCategoryPath}
            activeCategorySlug={activeCategorySlug}
            onActiveCategoryChange={onActiveCategoryChange}
            onCategoryClick={onCategoryClick}
          />
        ))}
      </div>
    </div>
  );
}
