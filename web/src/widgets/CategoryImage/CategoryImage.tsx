import type { CatalogCategory } from '@/shared/types/catalog-category';
import { cn } from '@/shared/utils/cn';

type CategoryImageProps = {
  category: CatalogCategory;
  size?: 'sm' | 'md' | 'lg' | 'full';
  placeholderMode?: 'short' | 'full';
  className?: string;
};

const sizeClasses = {
  sm: 'size-6 text-[6px]',
  md: 'size-8 text-[8px]',
  lg: 'size-12 text-[10px]',
  full: 'w-full'
};

export function CategoryImage({ 
  category, 
  size = 'md', 
  placeholderMode = 'short',
  className 
}: CategoryImageProps) {
  const hasImage = !!category.image;
  const sizeClass = sizeClasses[size];

  const getPlaceholderText = () => {
    if (placeholderMode === 'full') {
      return category.name;
    }
    return category.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
          <span className={cn('font-semibold', placeholderMode === 'full' && 'px-2 text-center')}>
            {getPlaceholderText()}
          </span>
        </div>
      )}
    </div>
  );
}
