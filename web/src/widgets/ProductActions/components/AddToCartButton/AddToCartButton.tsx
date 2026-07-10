import { Button } from '@/components/ui/Button';
import type { Ad } from '@/entities/ad';
import { useCartStore } from '@/entities/cart';
import type { Product } from '@/entities/product';
import { cn } from '@/shared/utils/cn';
import {
  ProductQuantityCounter,
  getProductActionHeightClass,
  type ProductQuantityCounterVariant,
} from '@/widgets/ProductQuantityCounter';

type AddToCartButtonProps = {
  variant?: ProductQuantityCounterVariant;
} & (
  | { itemType: 'product'; item: Product }
  | { itemType: 'ad'; item: Ad }
);

export function AddToCartButton({
  variant = 'card',
  itemType,
  item,
}: AddToCartButtonProps) {
  const quantity = useCartStore((state) => state.getItemQuantity(item.id));
  const addItem = useCartStore((state) => state.addItem);
  const adItems = useCartStore((state) => state.adItems);
  const addAdItem = useCartStore((state) => state.addAdItem);
  const removeAdItem = useCartStore((state) => state.removeAdItem);

  if (itemType === 'ad') {
    const isInCart = adItems.some((i) => i.ad.id === item.id);

    return (
      <Button
        type="button"
        variant={isInCart ? 'outline' : 'default'}
        size={variant === 'details' ? 'lg' : 'default'}
        className={cn(
          variant === 'details' ? 'flex-1' : 'w-full',
          getProductActionHeightClass(variant),
        )}
        onClick={() => (isInCart ? removeAdItem(item.id) : addAdItem(item))}
      >
        {isInCart ? 'Убрать из корзины' : 'В корзину'}
      </Button>
    );
  }

  if (quantity > 0) {
    return (
      <ProductQuantityCounter
        productId={item.id}
        variant={variant}
      />
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={variant === 'details' ? 'lg' : 'default'}
      className={cn('w-full', getProductActionHeightClass(variant))}
      onClick={() => addItem(item)}
    >
      В корзину
    </Button>
  );
}