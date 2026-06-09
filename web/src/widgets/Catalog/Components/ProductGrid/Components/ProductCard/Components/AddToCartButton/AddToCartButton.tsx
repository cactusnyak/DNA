import { Button } from '@/components/ui/Button';

type AddToCartButtonProps = {
  productId: string;
};

export function AddToCartButton({ productId }: AddToCartButtonProps) {
  function handleClick() {
    console.log('Add to cart:', productId);
  }

  return (
    <Button type="button" className="w-full" onClick={handleClick}>
      В корзину
    </Button>
  );
}