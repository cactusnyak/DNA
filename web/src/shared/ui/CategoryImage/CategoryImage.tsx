import type { CatalogCategory } from '@/shared/types/catalog-category';
import { cn } from '@/shared/utils/cn';

type CategoryImageProps = {
  category: CatalogCategory;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeClasses = {
  sm: 'size-6 text-[6px]',
  md: 'size-8 text-[8px]',
  lg: 'size-12 text-[10px]',
};

export function CategoryImage({ 
  category, 
  size = 'md', 
  className 
}: CategoryImageProps) {
  const hasImage = !!category.image;
  const sizeClass = sizeClasses[size];

  return (
    <div className={cn('flex shrink-0 overflow-hidden rounded-sm bg-muted', sizeClass, className)}>
      {hasImage ? (
        <img
          src={category.image!.url}
          alt={category.image!.alt ?? category.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          <span className="font-semibold">
            {category.name
              .split(' ')
              .map(word => word[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </span>
        </div>
      )}
    </div>
  );
}
