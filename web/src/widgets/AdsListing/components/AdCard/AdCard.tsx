import { Link } from 'react-router-dom';

import type { Ad } from '@/entities/ad';
import { CardFavouriteButton } from '@/entities/favourite';

import { ItemGallery } from '@/widgets/ItemGallery';
import { ItemActions } from '@/widgets/ItemActions';

import { AdCardContent } from './components/AdCardContent';

type AdCardProps = {
  ad: Ad;
  currentCategorySlug?: string;
};

export function AdCard({ ad, currentCategorySlug }: AdCardProps) {
  return (
    <Link
      to={`/ads/ad/${ad.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl p-1"
    >
      <div className="relative">
        <ItemGallery images={ad.images} title={ad.title} />

        <div
          className="absolute right-2 top-2 z-10"
          onClick={(e) => e.preventDefault()}
        >
          <CardFavouriteButton item={{ adId: ad.id }} />
        </div>
      </div>

      <AdCardContent ad={ad} currentCategorySlug={currentCategorySlug} />

      <div
        className="relative z-10 mt-auto p-2"
        onClick={(e) => e.preventDefault()}
      >
        <ItemActions
          itemType="ad"
          item={ad}
          variant="card"
          showSellerContactsButton
        />
      </div>
    </Link>
  );
}
