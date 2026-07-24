import type { CartStoreItem } from '@/entities/cart';
import { FavouriteButton } from '@/entities/favourite';
import { formatPrice } from '@/shared/utils/format-price';
import { ProductQuantityCounter } from '@/widgets/ProductQuantityCounter';

import { calculateCartItemTotal } from '../../logic/calculate-cart-item-total';
import { CartItemCard } from '../CartItemCard/CartItemCard';

type CartProductItemCardProps = {
  item: CartStoreItem;
  onRemove: (configurationKey: string) => void;
};

export function CartProductItemCard({ item, onRemove }: CartProductItemCardProps) {
  const { product, quantity } = item;
  const image = product.images[0];
  const itemTotal = calculateCartItemTotal(item);
  const selectedById = new Map(
    (item.selectedAdditions ?? []).map((addition) => [
      addition.additionId,
      addition,
    ]),
  );
  const additionLines = (product.additions ?? []).flatMap((addition) => {
    const selected = selectedById.get(addition.id);
    if (!selected || selected.type !== addition.type) return [];
    if (
      addition.type === 'boolean' &&
      selected.type === 'boolean' &&
      !selected.value &&
      !addition.required
    ) return [];
    const total =
      addition.type === 'boolean'
        ? selected.value
          ? addition.price
          : 0
        : Number(selected.value) * addition.price;
    const value =
      addition.type === 'boolean'
        ? selected.value
          ? 'Да'
          : 'Нет'
        : `${selected.value} ${addition.unitLabel} × ${formatPrice(addition.price)}`;
    return [`${addition.title}: ${value}, ${total ? `+${formatPrice(total)}` : formatPrice(0)}`];
  });

  return (
    <CartItemCard
      href={`/market/product/${product.slug}`}
      imageUrl={image?.url}
      imageAlt={image?.alt ?? product.title}
      placeholderText="Нет изображения"
      title={product.title}
      category={
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>{product.category.name}</p>
          {additionLines.map((line) => <p key={line}>{line}</p>)}
          {additionLines.length > 0 && (
            <p>Цена единицы: {formatPrice(item.configuredUnitPrice)}</p>
          )}
        </div>
      }
      price={<p className="text-base font-semibold sm:text-lg">{formatPrice(itemTotal)}</p>}
      priceMeta={`${quantity} × ${formatPrice(product.price)}`}
      actions={
        <div className="w-36 sm:w-40">
          <ProductQuantityCounter
            productId={item.configurationKey ?? product.id}
            variant="details"
          />
        </div>
      }
      favouriteButton={
        <FavouriteButton
          item={{ productId: product.id }}
          className="size-8 rounded-lg bg-muted hover:bg-muted/80"
        />
      }
      onRemove={() => onRemove(item.configurationKey ?? product.id)}
    />
  );
}
