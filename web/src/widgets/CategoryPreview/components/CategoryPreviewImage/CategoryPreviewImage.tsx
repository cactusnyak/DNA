import type { CatalogCategory } from '@/shared/types/catalog-category';

type CategoryPreviewImageProps = {
  category: CatalogCategory;
};

export const categoryPreviewLabelClassName =
  'flex items-center justify-center px-5 py-4 text-center text-sm font-medium leading-snug';

const categoryPreviewSizeClassName = 'h-36 w-50';

export function CategoryPreviewImage({
  category,
}: CategoryPreviewImageProps) {
  if (category.image) {
    return (
      <img
        src={category.image.url}
        alt={category.image.alt ?? category.name}
        className={`${categoryPreviewSizeClassName} object-cover transition-transform duration-300 group-hover:scale-105`}
      />
    );
  }

  return (
    <div
      className={`${categoryPreviewLabelClassName} ${categoryPreviewSizeClassName} bg-white text-foreground`}
    >
      <span>{category.name}</span>
    </div>
  );
}
