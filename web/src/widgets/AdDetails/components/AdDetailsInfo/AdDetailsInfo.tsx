import { Link } from 'react-router-dom';

import type { Ad } from '@/entities/ad';
import { getPlatformCategoryHref } from '@/shared/platform';
import { formatPrice } from '@/shared/utils/format-price';
import { ContentDescription } from '@/components/ui/ContentDescription';

type AdDetailsInfoProps = {
  ad: Ad;
};

const categoryBadgeClass =
  'inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground';

export function AdDetailsInfo({ ad }: AdDetailsInfoProps) {
  return (
    <div className="space-y-2">
      {ad.category && (
        <Link
          to={getPlatformCategoryHref(
            'ads',
            ad.category.path ?? ad.category.slug,
          )}
          className={categoryBadgeClass}
        >
          {ad.category.name}
        </Link>
      )}

      <h1 className="text-2xl font-semibold">{ad.title}</h1>
      <p className="text-3xl font-semibold">{formatPrice(ad.price)}</p>

      <ContentDescription description={ad.description} />
    </div>
  );
}
