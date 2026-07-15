import type { CartAdItem } from '@/entities/cart';
import { FavouriteButton } from '@/entities/favourite';
import { formatPrice } from '@/shared/utils/format-price';
import { LinkifyText } from '@/shared/utils/linkify';

import { CartItemCard } from '../CartItemCard/CartItemCard';

type CartAdItemCardProps = {
  item: CartAdItem;
  onRemove: (adId: string) => void;
};

const contactBadgeClass =
  'inline items-center rounded-md bg-muted/60 px-3 py-1.5 text-sm font-medium text-foreground transition-colors';

function getContactValues(ad: CartAdItem['ad']): string[] {
  return [
    ad.contactPhone,
    ad.contactTelegram,
    ad.contactEmail,
    ad.contactOther,
  ].filter((value): value is string => Boolean(value));
}

export function CartAdItemCard({ item, onRemove }: CartAdItemCardProps) {
  const { ad } = item;
  const image = ad.images?.[0];
  const sellerName = ad.seller
    ? `${ad.seller.firstName} ${ad.seller.lastName}`.trim()
    : 'Продавец';
  const contactValues = getContactValues(ad);

  return (
    <CartItemCard
      href={`/ads/ad/${ad.slug}`}
      imageUrl={image?.url}
      imageAlt={image?.alt ?? ad.title}
      title={ad.title}
      category={
        ad.category ? (
          <p className="text-sm text-muted-foreground">{ad.category.name}</p>
        ) : undefined
      }
      price={<p className="text-lg font-semibold">{formatPrice(ad.price)}</p>}
      priceMeta="Объявление"
      favouriteButton={
        <FavouriteButton
          item={{ adId: ad.id }}
          className="size-8 rounded-lg bg-muted hover:bg-muted/80"
        />
      }
      actions={
        <div
          className="flex flex-col gap-2 rounded-xl text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="font-medium text-foreground">{sellerName}</span>

          {contactValues.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {contactValues.map((value, index) => (
                <span key={`${value}-${index}`} className={contactBadgeClass}>
                  <LinkifyText text={value} renderLinks={false} />
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Контакты появятся позже.</p>
          )}
        </div>
      }
      onRemove={() => onRemove(ad.id)}
    />
  );
}
