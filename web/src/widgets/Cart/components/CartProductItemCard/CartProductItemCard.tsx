import type { CartStoreItem } from '@/entities/cart';
import { FavouriteButton } from '@/entities/favourite';
import { formatPrice } from '@/shared/utils/format-price';
import { ProductQuantityCounter } from '@/widgets/ProductQuantityCounter';

import { calculateCartItemTotal } from '../../logic/calculate-cart-item-total';
import { CartItemCard } from '../CartItemCard/CartItemCard';

type CartProductItemCardProps = {
  item: CartStoreItem;
  onRemove: (productId: string) => void;
};

export function CartProductItemCard({ item, onRemove }: CartProductItemCardProps) {
  const { product, quantity } = item;
  const image = product.images[0];
  const itemTotal = calculateCartItemTotal(item);

  return (
    <CartItemCard
      href={`/market/product/${product.id}`}
      imageUrl={image?.url}
      imageAlt={image?.alt ?? product.title}
      placeholderText="Нет изображения"
      title={product.title}
      category={
        <p className="text-sm text-muted-foreground">
          {product.category.name}
        </p>
      }
      price={<p className="text-lg font-semibold">{formatPrice(itemTotal)}</p>}
      priceMeta={`${quantity} × ${formatPrice(product.price)}`}
      actions={
        <div
          className="w-full sm:w-40"
          onClick={(e) => e.stopPropagation()}
        >
          <ProductQuantityCounter productId={product.id} variant="details" />
        </div>
      }
      favouriteButton={
        <FavouriteButton
          item={{ productId: product.id }}
          className="size-8 rounded-lg bg-muted hover:bg-muted/80"
        />
      }
      onRemove={() => onRemove(product.id)}
    />
  );
}
