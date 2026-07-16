import { Link, useNavigate } from 'react-router-dom';

import type { Ad } from '@/entities/ad';
import { FavouriteButton } from '@/entities/favourite';
import {
  getPlatformCategoryHref,
  PLATFORM_SECTION,
} from '@/shared/platform';
import { formatPrice } from '@/shared/utils/format-price';

import { ItemGallery } from '@/shared/ui/ItemGallery';
import { ItemActions } from '@/widgets/ItemActions';

type AdCardProps = {
  ad: Ad;
  currentCategorySlug?: string;
};

export function AdCard({ ad, currentCategorySlug }: AdCardProps) {
  const navigate = useNavigate();
  const categoryHref = ad.category
    ? getPlatformCategoryHref(PLATFORM_SECTION.ADS, ad.category.path)
    : null;
  const shouldShowCategoryLink =
    !!ad.category &&
    !!categoryHref &&
    (!currentCategorySlug || currentCategorySlug !== ad.category.slug);
  return (
    <Link
      to={`/ads/ad/${ad.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-card p-1 transition-colors hover:bg-muted/40"
    >
      <div className="relative">
        <ItemGallery images={ad.images} title={ad.title} />

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

          {shouldShowCategoryLink && (
            <span
              role="link"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(categoryHref!); }}
              className="mt-0.5 block cursor-pointer text-xs text-muted-foreground/70 underline-offset-2 hover:text-foreground"
            >
              В категорию «{ad.category!.name}»
            </span>
          )}
        </div>
      </div>

      <div
        className="relative z-10 mt-auto p-4 pt-0"
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
