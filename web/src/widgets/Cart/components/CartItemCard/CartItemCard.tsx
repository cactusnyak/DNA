import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/shared/utils/cn';

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
        className={cn(
          'grid gap-0 rounded-2xl border border-border bg-card grid-cols-[72px_minmax(0,1fr)] sm:grid-cols-[120px_minmax(0,1fr)]',
          className,
        )}
      >
        <div className="border-r border-border p-2 sm:p-3">
          <div className="aspect-square overflow-hidden rounded-sm bg-muted">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={imageAlt ?? title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center p-2 text-center text-xs text-muted-foreground sm:p-6 sm:text-sm">
                {placeholderText}
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 space-y-3 p-2 sm:space-y-4 sm:p-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-0.5 sm:space-y-1">
              <h3 className="line-clamp-2 text-sm font-semibold sm:text-base">
                {title}
              </h3>

              {category}
            </div>

            <div className="shrink-0 text-right">
              {price}
              {priceMeta && (
                <p className="text-xs text-muted-foreground">{priceMeta}</p>
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

            <div className="flex items-center gap-1">
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
