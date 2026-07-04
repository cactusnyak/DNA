import { Link } from 'react-router-dom';

import type { Ad } from '@/entities/ad';
import { formatPrice } from '@/shared/utils/format-price';

type AdCardProps = {
  ad: Ad;
};

export function AdCard({ ad }: AdCardProps) {
  const coverImage = ad.images[0];

  return (
    <Link
      to={`/ads/ad/${ad.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-foreground/30"
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        {coverImage ? (
          <img
            src={coverImage.url}
            alt={coverImage.alt ?? ad.title}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
            Нет фото
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="line-clamp-2 font-semibold">{ad.title}</p>

        {ad.category && (
          <p className="text-xs text-muted-foreground">{ad.category.name}</p>
        )}

        <p className="mt-auto text-lg font-semibold">{formatPrice(ad.price)}</p>
      </div>
    </Link>
  );
}
