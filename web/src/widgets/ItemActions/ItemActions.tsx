import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import type { Ad } from '@/entities/ad';
import { useCartStore } from '@/entities/cart';
import { FavouriteButton } from '@/entities/favourite';
import type { Product, SelectedProductAddition } from '@/entities/product';
import {
  getProductActionHeightClass,
  type ProductQuantityCounterVariant,
} from '@/widgets/ProductQuantityCounter';

import { AddToCartButton } from './components/AddToCartButton';
import { SellerContactsButton } from './components/SellerContactsButton';

type ItemActionsProps = {
  variant?: ProductQuantityCounterVariant;
  showAddToCartButton?: boolean;
  showBuyNowButton?: boolean;
  showFavouriteButton?: boolean;
  showSellerContactsButton?: boolean;
  selectedAdditions?: SelectedProductAddition[];
  isProductConfigurationValid?: boolean;
  onInvalidProductConfiguration?: () => void;
} & (
    | { itemType: 'product'; item: Product }
    | { itemType: 'ad'; item: Ad }
  );

export function ItemActions({
  itemType,
  item,
  variant = 'secondary',
  showAddToCartButton = true,
  showBuyNowButton = true,
  showFavouriteButton = false,
  showSellerContactsButton = false,
  selectedAdditions = [],
  isProductConfigurationValid = true,
  onInvalidProductConfiguration,
}: ItemActionsProps) {
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

  function handleBuyNow() {
    if (itemType === 'product') {
      if (!isProductConfigurationValid) {
        onInvalidProductConfiguration?.();
        return;
      }
      addItem(item, selectedAdditions);
      navigate('/checkout');
    }
  }

  const isProduct = itemType === 'product';

  if (
    !showAddToCartButton &&
    !showBuyNowButton &&
    !showFavouriteButton &&
    !(itemType === 'ad' && showSellerContactsButton)
  ) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {!isProduct && showSellerContactsButton && (
        <SellerContactsButton ad={item} variant={variant} />
      )}
      
      {(showAddToCartButton || showFavouriteButton) && (
        <div className="flex items-start gap-2">
          {showAddToCartButton && (
            <div className="flex-1">
              {itemType === 'product' ? (
                <AddToCartButton
                  itemType="product"
                  item={item as Product}
                  variant={variant}
                  selectedAdditions={selectedAdditions}
                  isConfigurationValid={isProductConfigurationValid}
                  onInvalidConfiguration={onInvalidProductConfiguration}
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
              className={[
                'shrink-0 rounded-lg',
                variant === 'details' ? 'size-9' : 'size-8',
              ].filter(Boolean).join(' ')}
            />
          )}
        </div>
      )}



      {isProduct && showBuyNowButton && (
        <Button
          type="button"
          size={variant === 'details' ? 'lg' : 'default'}
          className={['w-full', getProductActionHeightClass(variant)].filter(Boolean).join(' ')}
          onClick={handleBuyNow}
        >
          Купить в 1 клик
        </Button>
      )}
    </div>
  );
}
