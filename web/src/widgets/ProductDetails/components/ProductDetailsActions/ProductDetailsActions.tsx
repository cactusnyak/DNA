import type { Product } from '@/entities/product';
import { ItemActions } from '@/widgets/ItemActions';

type ProductDetailsActionsProps = {
  product: Product;
};

export function ProductDetailsActions({ product }: ProductDetailsActionsProps) {
  return (
    <ItemActions
      itemType="product"
      item={product}
      variant="details"
      showFavouriteButton
    />
  );
}