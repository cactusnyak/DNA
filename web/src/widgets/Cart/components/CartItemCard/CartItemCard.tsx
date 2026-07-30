import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';

type CartItemCardProps = {
  href: string;
  imageUrl?: string;
  imageAlt?: string;
  placeholderText?: string;
  title: string;
  category?: React.ReactNode;
  price: React.ReactNode;
  priceMeta?: React.ReactNode;
  actions: React.ReactNode;
  favouriteButton?: React.ReactNode;
  onRemove: () => void;
  className?: string;
};

export function CartItemCard({
  href,
  imageUrl,
  imageAlt,
  placeholderText = 'Нет фото',
  title,
  category,
  price,
  priceMeta,
  actions,
  favouriteButton,
  onRemove,
  className,
}: CartItemCardProps) {
  return (
    <Link to={href} className="block">
      <article
        className={[
          'grid grid-cols-[96px_minmax(0,1fr)] overflow-hidden rounded-2xl bg-white shadow-card-xl sm:grid-cols-[120px_minmax(0,1fr)]',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="p-2">
          <div className="aspect-[4/5] overflow-hidden rounded-lg bg-muted/50">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={imageAlt ?? title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center p-3 text-center text-xs text-muted-foreground sm:text-sm">
                {placeholderText}
              </div>
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-between gap-4 p-3 sm:p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-1">
              <h3 className="line-clamp-2 text-sm font-semibold leading-5 sm:text-base">
                {title}
              </h3>

              {category}
            </div>

            <div className="shrink-0 space-y-0.5 text-right">
              {price}

              {priceMeta && (
                <p className="text-xs text-muted-foreground">
                  {priceMeta}
                </p>
              )}
            </div>
          </div>

          <div
            className="flex items-end justify-between gap-4"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            {actions}

            <div className="flex shrink-0 items-center gap-1">
              {favouriteButton}

              <Button
                type="button"
                variant="destructive"
                size="icon"
                aria-label="Удалить"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onRemove();
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}