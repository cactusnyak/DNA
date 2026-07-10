import { Link } from 'react-router-dom';

import type { Ad } from '@/entities/ad';
import { FavouriteButton } from '@/entities/favourite';
import { formatPrice } from '@/shared/utils/format-price';

import { AddToCartButton } from '@/widgets/ProductActions';
import { AdGallery } from './components/AdGallery/AdGallery';

type AdCardProps = {
  ad: Ad;
};

export function AdCard({ ad }: AdCardProps) {
  return (
    <Link
      to={`/ads/ad/${ad.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-card p-1 transition-colors hover:bg-muted/40"
    >
      <div className="relative">
        <AdGallery images={ad.images} title={ad.title} />

        <div
          className="absolute right-2 top-2 z-10"
          onClick={(e) => e.preventDefault()}
        >
          <FavouriteButton item={{ adId: ad.id }} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xl font-bold">{formatPrice(ad.price)}</p>

        <div className="mt-2">
          <h3 className="line-clamp-2 font-semibold">{ad.title}</h3>

          {ad.category && (
            <p className="mt-0.5 text-xs text-muted-foreground/70">
              {ad.category.name}
            </p>
          )}
        </div>
      </div>

      <div
        className="relative z-10 mt-auto p-4 pt-0"
        onClick={(e) => e.preventDefault()}
      >
        <AddToCartButton itemType="ad" item={ad} variant="card" />
      </div>
    </Link>
  );
}
