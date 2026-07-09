import { Heart } from 'lucide-react';

import { cn } from '@/shared/utils/cn';

import { useFavourite } from '../../hooks/use-favourite';
import type { FavouriteItem } from '../../types/favourite-item';

type FavouriteButtonProps = {
  item: FavouriteItem;
  className?: string;
};

export function FavouriteButton({ item, className }: FavouriteButtonProps) {
  const { isFavourite, toggle, isPending } = useFavourite(item);

  return (
    <button
      type="button"
      aria-label={isFavourite ? 'Убрать из избранного' : 'Добавить в избранное'}
      disabled={isPending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      className={cn(
        'group/fav flex cursor-pointer items-center justify-center rounded-full p-1.5 transition-colors',
        'backdrop-blur-sm',
        'disabled:opacity-50',
        className,
      )}
    >
      <Heart
        className={cn(
          'size-4 transition-colors',
          isFavourite
            ? 'fill-red-500 stroke-red-500'
            : 'stroke-muted-foreground group-hover/fav:stroke-red-400',
        )}
      />
    </button>
  );
}
