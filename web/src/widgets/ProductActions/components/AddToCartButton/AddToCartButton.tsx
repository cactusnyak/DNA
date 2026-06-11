import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/entities/cart';
import type { Product } from '@/entities/product';
import { cn } from '@/shared/utils/cn';
import {
  ProductQuantityCounter,
  getProductActionHeightClass,
  type ProductQuantityCounterVariant,
} from '@/widgets/ProductQuantityCounter';

type AddToCartButtonProps = {
  product: Product;
  variant?: ProductQuantityCounterVariant;
};

export function AddToCartButton({
  product,
  variant = 'card',
}: AddToCartButtonProps) {
  const quantity = useCartStore((state) => state.getItemQuantity(product.id));
  const addItem = useCartStore((state) => state.addItem);

  if (quantity > 0) {
    return (
      <ProductQuantityCounter
        productId={product.id}
        variant={variant}
      />
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={variant === 'details' ? 'lg' : 'default'}
      className={cn('w-full bg-background', getProductActionHeightClass(variant))}
      onClick={() => addItem(product)}
    >
      В корзину
    </Button>
  );
}