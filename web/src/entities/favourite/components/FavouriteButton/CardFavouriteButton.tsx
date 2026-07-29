import type { FavouriteItem } from '../../types/favourite-item';

import { FavouriteButtonBase } from './FavouriteButtonBase';

type CardFavouriteButtonProps = {
  item: FavouriteItem;
};

export function CardFavouriteButton({ item }: CardFavouriteButtonProps) {
  return (
    <FavouriteButtonBase
      item={item}
      className="rounded-full bg-white/75 shadow-sm"
      inactiveIconClassName="stroke-primary"
    />
  );
}
