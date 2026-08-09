import { useCartStore, type CartStoreItem } from '@/entities/cart';
import { FavouriteButton } from '@/entities/favourite';
import { formatPrice } from '@/shared/utils/format-price';
import { ProductQuantityCounter } from '@/widgets/ProductQuantityCounter';
import { OversizedIndicator } from '@/components/OversizedIndicator/OversizedIndicator';
import { OversizedDeliveryModal } from '@/widgets/OversizedDeliveryModal';

import { calculateCartItemTotal } from '../../logic/calculate-cart-item-total';
import { CartItemCard } from '../CartItemCard/CartItemCard';

type CartProductItemCardProps = {
  item: CartStoreItem;
  onRemove: (configurationKey: string) => void;
};

export function CartProductItemCard({
  item,
  onRemove,
}: CartProductItemCardProps) {
  const setQuote = useCartStore((state) => state.setDeliveryQuote);
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
      addition.type === 'quantity' &&
      selected.type === 'quantity' &&
      Number(selected.value) === 0
    ) {
      return [];
    }
    if (
      addition.type === 'boolean' &&
      selected.type === 'boolean' &&
      !selected.value &&
      !addition.required
    )
      return [];
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
    return [
      `${addition.title}: ${value}, ${total ? `+${formatPrice(total)}` : formatPrice(0)}`,
    ];
  });
  return (
    <CartItemCard
      href={`/market/product/${product.slug}`}
      imageUrl={image?.url}
      imageAlt={image?.alt ?? product.title}
      placeholderText="Нет изображения"
      title={product.title}
      category={
        <div className="flex min-w-0 flex-col gap-3 break-words text-xs text-muted-foreground sm:text-sm">
          <p>{product.category.name}</p>
          {product.isOversized && (
            <div className="flex flex-col gap-2">
              <OversizedIndicator renderAsSpan />
              <OversizedDeliveryModal
                product={product}
                cartLineKey={item.configurationKey}
                quantity={quantity}
                configuredUnitPrice={item.configuredUnitPrice}
                initialQuote={item.deliveryQuote}
                triggerClassName="h-auto min-h-8 w-full whitespace-normal px-3 py-2 text-xs text-left leading-4"
                triggerLabel={
                  item.deliveryQuote ? 'Открыть расчёт доставки' : undefined
                }
                onQuoteChange={(quote) =>
                  setQuote(item.configurationKey ?? product.id, quote)
                }
              />
              {item.deliveryQuote?.status === 'ACCEPTED' && (
                <p className="px-3 text-xs text-emerald-700 dark:text-emerald-300">
                  Доставка:{' '}
                  {formatPrice(item.deliveryQuote.confirmedDeliveryPrice ?? 0)}
                </p>
              )}
            </div>
          )}
          {additionLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
          {additionLines.length > 0 && (
            <p>Цена единицы: {formatPrice(item.configuredUnitPrice)}</p>
          )}
        </div>
      }
      price={
        <p className="text-base font-semibold sm:text-lg">
          {formatPrice(
            itemTotal +
              (item.deliveryQuote?.status === 'ACCEPTED'
                ? (item.deliveryQuote.confirmedDeliveryPrice ?? 0)
                : 0),
          )}
        </p>
      }
      priceMeta={`${quantity} × ${formatPrice(item.configuredUnitPrice ?? product.price)}${item.deliveryQuote?.status === 'ACCEPTED' ? ' + доставка' : ''}`}
      actions={
        <div className="w-full sm:w-40">
          <ProductQuantityCounter
            productId={item.configurationKey ?? product.id}
            variant="details"
          />
        </div>
      }
      favouriteButton={
        <FavouriteButton
          item={{ productId: product.id }}
          className="size-8 rounded-lg"
        />
      }
      onRemove={() => onRemove(item.configurationKey ?? product.id)}
    />
  );
}
