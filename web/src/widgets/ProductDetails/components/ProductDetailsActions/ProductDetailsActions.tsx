import type { Product, SelectedProductAddition } from '@/entities/product';
import { ItemActions } from '@/widgets/ItemActions';

type ProductDetailsActionsProps = {
  product: Product;
  selectedAdditions: SelectedProductAddition[];
  isConfigurationValid: boolean;
  onInvalidConfiguration: () => void;
};

export function ProductDetailsActions({
  product,
  selectedAdditions,
  isConfigurationValid,
  onInvalidConfiguration,
}: ProductDetailsActionsProps) {
  return (
    <ItemActions
      itemType="product"
      item={product}
      selectedAdditions={selectedAdditions}
      isProductConfigurationValid={isConfigurationValid}
      onInvalidProductConfiguration={onInvalidConfiguration}
      variant="details"
      showFavouriteButton
    />
  );
}
