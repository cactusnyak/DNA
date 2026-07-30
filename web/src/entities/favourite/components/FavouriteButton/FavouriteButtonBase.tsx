import { Heart } from 'lucide-react';

import { useFavourite } from '../../hooks/use-favourite';
import type { FavouriteItem } from '../../types/favourite-item';

type FavouriteButtonBaseProps = {
  item: FavouriteItem;
  className: string;
  inactiveIconClassName: string;
};

export function FavouriteButtonBase({
  item,
  className,
  inactiveIconClassName,
}: FavouriteButtonBaseProps) {
  const { isFavourite, toggle, isPending } = useFavourite(item);

  return (
    <button
      type="button"
      aria-label={isFavourite ? 'Убрать из избранного' : 'Добавить в избранное'}
      aria-pressed={isFavourite}
      disabled={isPending}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle();
      }}
      className={[
        'group/fav flex cursor-pointer items-center justify-center p-1 backdrop-blur-sm disabled:opacity-50',
        className,
      ].filter(Boolean).join(' ')}
    >
      <Heart
        className={[
          'size-4 ',
          isFavourite
            ? 'fill-favourite stroke-favourite'
            : `fill-transparent ${inactiveIconClassName} group-hover/fav:stroke-red-400`,
        ].filter(Boolean).join(' ')}
        aria-hidden="true"
      />
    </button>
  );
}
