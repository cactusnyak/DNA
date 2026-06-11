import { Button } from '@/components/ui/Button';
import type { Product } from '@/entities/product';
import { useCartStore } from '@/entities/cart';
import { ProductQuantityCounter } from '@/widgets/ProductQuantityCounter';

type AddToCartButtonProps = {
  product: Product;
};

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const quantity = useCartStore((state) => state.getItemQuantity(product.id));
  const addItem = useCartStore((state) => state.addItem);

  if (quantity > 0) {
    return <ProductQuantityCounter productId={product.id} />;
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full bg-background"
      onClick={() => addItem(product)}
    >
      В корзину
    </Button>
  );
}