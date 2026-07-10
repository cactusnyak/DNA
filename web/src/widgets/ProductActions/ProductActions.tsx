import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/entities/cart';
import type { Product } from '@/entities/product';
import { cn } from '@/shared/utils/cn';
import {
  getProductActionHeightClass,
  type ProductQuantityCounterVariant,
} from '@/widgets/ProductQuantityCounter';

import { AddToCartButton } from './components/AddToCartButton';

type ProductActionsProps = {
  product: Product;
  variant?: ProductQuantityCounterVariant;
  showAddToCartButton?: boolean;
  showBuyNowButton?: boolean;
};

export function ProductActions({
  product,
  variant = 'card',
  showAddToCartButton = true,
  showBuyNowButton = true,
}: ProductActionsProps) {
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

  function handleBuyNow() {
    addItem(product);
    navigate('/checkout');
  }

  if (!showAddToCartButton && !showBuyNowButton) {
    return null;
  }

  return (
    <div className="space-y-2">
      {showAddToCartButton && (
        <AddToCartButton itemType="product" item={product} variant={variant} />
      )}

      {showBuyNowButton && (
        <Button
          type="button"
          size={variant === 'details' ? 'lg' : 'default'}
          className={cn('w-full', getProductActionHeightClass(variant))}
          onClick={handleBuyNow}
        >
          Купить в 1 клик
        </Button>
      )}
    </div>
  );
}