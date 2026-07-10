import type { Ad } from '@/entities/ad';
import { ItemActions } from '@/widgets/ItemActions';

type AdDetailsActionsProps = {
  ad: Ad;
};

export function AdDetailsActions({ ad }: AdDetailsActionsProps) {
  return (
    <ItemActions
      itemType="ad"
      item={ad}
      variant="details"
      showFavouriteButton
    />
  );
}
