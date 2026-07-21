import { Link } from 'react-router-dom';

import type { Ad } from '@/entities/ad';
import { formatPrice } from '@/shared/utils/format-price';
import { cn } from '@/shared/utils/cn';

type AdCardProps = {
  ad: Ad;
  className?: string;
};

export function CompactAdCard({ ad, className }: AdCardProps) {
  const image = ad.images[0];

  return (
    <Link
      to={`/ads/ad/${ad.slug}`}
      className={cn(
        'group flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 min-w-0 max-w-[280px]',
        className
      )}
    >
      <div className="aspect-square overflow-hidden bg-muted">
        {image ? (
          <img
            src={image.url}
            alt={image.alt ?? ad.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            Нет фото
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {ad.title}
        </h3>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-bold text-primary">
            {formatPrice(ad.price)}
          </span>

          {ad.category && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              {ad.category.name}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
