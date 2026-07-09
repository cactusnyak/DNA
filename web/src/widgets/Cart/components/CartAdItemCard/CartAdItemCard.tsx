import { Link } from 'react-router-dom';
import { Mail, Phone, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import type { CartAdItem } from '@/entities/cart';
import { formatPrice } from '@/shared/utils/format-price';

type CartAdItemCardProps = {
  item: CartAdItem;
  onRemove: (adId: string) => void;
};

export function CartAdItemCard({ item, onRemove }: CartAdItemCardProps) {
  const { ad } = item;
  const image = ad.images?.[0];

  return (
    <article className="grid gap-4 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[120px_minmax(0,1fr)]">
      <Link
        to={`/ads/ad/${ad.id}`}
        className="block overflow-hidden rounded-xl bg-muted"
      >
        {image ? (
          <img
            src={image.url}
            alt={image.alt ?? ad.title}
            className="aspect-square w-full object-cover"
          />
        ) : (
          <div className="flex aspect-square items-center justify-center p-6 text-center text-sm text-muted-foreground">
            Нет фото
          </div>
        )}
      </Link>

      <div className="min-w-0 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <Link
              to={`/ads/ad/${ad.id}`}
              className="line-clamp-2 font-semibold underline-offset-4 hover:underline"
            >
              {ad.title}
            </Link>

            {ad.category && (
              <p className="text-sm text-muted-foreground">{ad.category.name}</p>
            )}
          </div>

          <div className="shrink-0 text-left sm:text-right">
            <p className="text-lg font-semibold">{formatPrice(ad.price)}</p>
            <p className="text-xs text-muted-foreground">Объявление</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          {ad.seller && (
            <div className="space-y-1 rounded-xl bg-muted/60 px-3 py-2 text-sm">
              <p className="font-medium text-foreground">
                {ad.seller.firstName} {ad.seller.lastName}
              </p>

              {ad.seller.phone && (
                <a
                  href={`tel:${ad.seller.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <Phone className="size-3.5" />
                  {ad.seller.phone}
                </a>
              )}

              {ad.seller.email && (
                <a
                  href={`mailto:${ad.seller.email}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <Mail className="size-3.5" />
                  {ad.seller.email}
                </a>
              )}
            </div>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="justify-start text-muted-foreground hover:text-destructive sm:justify-center"
            onClick={() => onRemove(ad.id)}
          >
            <Trash2 className="size-4" />
            Удалить
          </Button>
        </div>
      </div>
    </article>
  );
}
