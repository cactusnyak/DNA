import { Link } from 'react-router-dom';

import type { Ad } from '@/entities/ad';
import { FavouriteButton } from '@/entities/favourite';
import { formatPrice } from '@/shared/utils/format-price';

import { AdGallery } from './components/AdGallery/AdGallery';

type AdCardProps = {
  ad: Ad;
};

export function AdCard({ ad }: AdCardProps) {
  return (
    <Link
      to={`/ads/ad/${ad.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-foreground/30"
    >
      <div className="relative">
        <AdGallery images={ad.images} title={ad.title} />

        <div className="absolute right-2 top-2 z-10">
          <FavouriteButton item={{ adId: ad.id }} />
        </div>
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
