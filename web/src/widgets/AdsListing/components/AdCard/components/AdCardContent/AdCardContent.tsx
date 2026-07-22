import { useNavigate } from 'react-router-dom';

import type { Ad } from '@/entities/ad';
import {
  getPlatformCategoryHref,
  PLATFORM_SECTION,
} from '@/shared/platform';
import { formatPrice } from '@/shared/utils/format-price';

type AdCardContentProps = {
  ad: Ad;
  currentCategorySlug?: string;
};

export function AdCardContent({
  ad,
  currentCategorySlug,
}: AdCardContentProps) {
  const navigate = useNavigate();
  const categoryHref = ad.category
    ? getPlatformCategoryHref(
      PLATFORM_SECTION.ADS,
      ad.category.path ?? ad.category.slug,
    )
    : null;
  const shouldShowCategoryLink =
    !!categoryHref &&
    (!currentCategorySlug || currentCategorySlug !== ad.category?.slug);

  return (
    <div className="flex flex-1 flex-col p-2">
      <p className="text-xl font-bold">{formatPrice(ad.price)}</p>

      <div className="mt-2">
        <h3 className="line-clamp-2 font-semibold">{ad.title}</h3>

        {shouldShowCategoryLink && categoryHref && (
          <span
            role="link"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              navigate(categoryHref);
            }}
            className="mt-0.5 block cursor-pointer text-xs text-muted-foreground/70 underline-offset-2 hover:text-foreground"
          >
            В категорию «{ad.category?.name}»
          </span>
        )}
      </div>
    </div>
  );
}
