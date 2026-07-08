import { Link } from 'react-router-dom';
import { Phone, Mail, X } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import type { CartAdItem } from '@/entities/cart';
import { formatPrice } from '@/shared/utils/format-price';

type CartAdItemsListProps = {
  adItems: CartAdItem[];
  onRemove: (adId: string) => void;
};

export function CartAdItemsList({ adItems, onRemove }: CartAdItemsListProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Объявления</h2>

      <p className="text-sm text-muted-foreground">
        Товары с доски объявлений. Для покупки свяжитесь с продавцом напрямую.
      </p>

      <ul className="space-y-3">
        {adItems.map(({ ad }) => {
          const cover = ad.images?.[0];

          return (
            <li
              key={ad.id}
              className="flex gap-4 rounded-2xl border border-border bg-card p-4"
            >
              <Link
                to={`/ads/ad/${ad.id}`}
                className="size-20 shrink-0 overflow-hidden rounded-xl bg-muted"
              >
                {cover ? (
                  <img
                    src={cover.url}
                    alt={cover.alt ?? ad.title}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                    Нет фото
                  </div>
                )}
              </Link>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to={`/ads/ad/${ad.id}`}
                    className="font-semibold leading-tight hover:underline underline-offset-4 line-clamp-2"
                  >
                    {ad.title}
                  </Link>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0 -mr-2 -mt-1 text-muted-foreground"
                    onClick={() => onRemove(ad.id)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>

                <p className="text-lg font-semibold">{formatPrice(ad.price)}</p>

                {ad.seller && (
                  <div className="space-y-1 rounded-xl bg-muted/50 px-3 py-2 text-sm">
                    <p className="font-medium">
                      {ad.seller.firstName} {ad.seller.lastName}
                    </p>

                    {ad.seller.phone && (
                      <a
                        href={`tel:${ad.seller.phone}`}
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                      >
                        <Phone className="size-3.5" />
                        {ad.seller.phone}
                      </a>
                    )}

                    {ad.seller.email && (
                      <a
                        href={`mailto:${ad.seller.email}`}
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                      >
                        <Mail className="size-3.5" />
                        {ad.seller.email}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
