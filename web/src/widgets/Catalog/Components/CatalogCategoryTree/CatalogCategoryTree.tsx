import type { Category } from '@/entities/category';
import { cn } from '@/shared/utils/cn';

type CatalogCategoryTreeProps = {
  categories: Category[];
  selectedCategorySlug?: string;
  onCategoryChange: (categorySlug?: string) => void;
};

function getChildrenCategories(categories: Category[], parentId?: string) {
  return categories.filter((category) => category.parentId === parentId);
}

type CategoryTreeLevelProps = {
  categories: Category[];
  parentId?: string;
  selectedCategorySlug?: string;
  onCategoryChange: (categorySlug?: string) => void;
  level?: number;
};

function CategoryTreeLevel({
  categories,
  parentId,
  selectedCategorySlug,
  onCategoryChange,
  level = 0,
}: CategoryTreeLevelProps) {
  const childrenCategories = getChildrenCategories(categories, parentId);

  if (!childrenCategories.length) {
    return null;
  }

  return (
    <div className={cn('flex flex-col gap-1', level > 0 && 'pl-4')}>
      {childrenCategories.map((category) => {
        const isActive = selectedCategorySlug === category.slug;

        return (
          <div key={category.id} className="space-y-1">
            <button
              type="button"
              onClick={() => onCategoryChange(category.slug)}
              className={cn(
                'w-full cursor-pointer rounded-md border border-border px-3 py-1 text-left text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-muted',
              )}
            >
              {category.name}
            </button>

            <CategoryTreeLevel
              categories={categories}
              parentId={category.id}
              selectedCategorySlug={selectedCategorySlug}
              onCategoryChange={onCategoryChange}
              level={level + 1}
            />
          </div>
        );
      })}
    </div>
  );
}

export function CatalogCategoryTree({
  categories,
  selectedCategorySlug,
  onCategoryChange,
}: CatalogCategoryTreeProps) {
  return (
    <div className="w-full space-y-2">
      <button
        type="button"
        onClick={() => onCategoryChange(undefined)}
        className={cn(
          'w-full cursor-pointer rounded-md border border-border px-3 py-1 text-left text-sm transition-colors',
          !selectedCategorySlug
            ? 'bg-primary text-primary-foreground'
            : 'bg-background hover:bg-muted',
        )}
      >
        Все товары
      </button>

      <CategoryTreeLevel
        categories={categories}
        selectedCategorySlug={selectedCategorySlug}
        onCategoryChange={onCategoryChange}
      />
    </div>
  );
}