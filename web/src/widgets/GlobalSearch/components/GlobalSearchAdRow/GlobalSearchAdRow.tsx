import { Link } from 'react-router-dom';

import type { Ad } from '@/entities/ad';
import { formatPrice } from '@/shared/utils/format-price';
import { MarkHighlight } from '@/shared/ui/MarkHighlight';

type GlobalSearchAdRowProps = {
  ad: Ad;
  searchValue: string;
  onNavigate: () => void;
};

export function GlobalSearchAdRow({ ad, searchValue, onNavigate }: GlobalSearchAdRowProps) {
  const image = ad.images[0];

  return (
    <Link
      to={`/ads/ad/${ad.id}`}
      onClick={onNavigate}
      className="grid grid-cols-[56px_minmax(0,1fr)] gap-3 rounded-xl p-2 transition-colors hover:bg-muted"
    >
      <div className="size-14 overflow-hidden rounded-md bg-muted">
        {image ? (
          <img
            src={image.url}
            alt={image.alt ?? ad.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
            Нет фото
          </div>
        )}
      </div>

      <div className="min-w-0 p-1">
        <p className="line-clamp-2 text-sm font-medium leading-5">
          <MarkHighlight text={ad.title} searchValue={searchValue} level={1} />
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-semibold">{formatPrice(ad.price)}</span>

          {ad.category && (
            <span className="text-xs text-muted-foreground">
              <MarkHighlight text={ad.category.name} searchValue={searchValue} level={2} />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
