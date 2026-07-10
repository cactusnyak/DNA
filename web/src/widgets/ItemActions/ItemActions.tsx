import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import type { Ad } from '@/entities/ad';
import { useCartStore } from '@/entities/cart';
import { FavouriteButton } from '@/entities/favourite';
import type { Product } from '@/entities/product';
import { cn } from '@/shared/utils/cn';
import {
  getProductActionHeightClass,
  type ProductQuantityCounterVariant,
} from '@/widgets/ProductQuantityCounter';

import { AddToCartButton } from './components/AddToCartButton';

type ItemActionsProps = {
  variant?: ProductQuantityCounterVariant;
  showAddToCartButton?: boolean;
  showBuyNowButton?: boolean;
  showFavouriteButton?: boolean;
} & (
  | { itemType: 'product'; item: Product }
  | { itemType: 'ad'; item: Ad }
);

export function ItemActions({
  itemType,
  item,
  variant = 'card',
  showAddToCartButton = true,
  showBuyNowButton = true,
  showFavouriteButton = false,
}: ItemActionsProps) {
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

  function handleBuyNow() {
    if (itemType === 'product') {
      addItem(item);
      navigate('/checkout');
    }
  }

  const isProduct = itemType === 'product';

  if (!showAddToCartButton && !showBuyNowButton && !showFavouriteButton) {
    return null;
  }

  return (
    <div className="space-y-2">
      {(showAddToCartButton || showFavouriteButton) && (
        <div className="flex items-start gap-2">
          {showAddToCartButton && (
            <div className="flex-1">
              {itemType === 'product' ? (
                <AddToCartButton
                  itemType="product"
                  item={item as Product}
                  variant={variant}
                />
              ) : (
                <AddToCartButton
                  itemType="ad"
                  item={item as Ad}
                  variant={variant}
                />
              )}
            </div>
          )}

          {showFavouriteButton && (
            <FavouriteButton
              item={
                itemType === 'product'
                  ? { productId: item.id }
                  : { adId: item.id }
              }
              className={cn(
                'shrink-0 rounded-lg border border-border',
                variant === 'details' ? 'size-9' : 'size-8',
              )}
            />
          )}
        </div>
      )}

      {isProduct && showBuyNowButton && (
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
