import type { CatalogCategory } from '@/shared/types/catalog-category';

type CatalogDropdownCategoryImageProps = {
  category: CatalogCategory;
};

export function CatalogDropdownCategoryImage({
  category,
}: CatalogDropdownCategoryImageProps) {
  const placeholderText = category.name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex size-8 shrink-0 items-center overflow-hidden rounded-sm text-xs">
      {category.image ? (
        <img
          src={category.image.url}
          alt={category.image.alt ?? category.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-primary">
          <span className="font-semibold">{placeholderText}</span>
        </div>
      )}
    </div>
  );
}
