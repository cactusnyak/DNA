import type { Ad } from '@/entities/ad';
import { AddToCartButton } from '@/widgets/ProductActions';

type AdDetailsActionsProps = {
  ad: Ad;
};

export function AdDetailsActions({ ad }: AdDetailsActionsProps) {
  return <AddToCartButton itemType="ad" item={ad} variant="details" />;
}
