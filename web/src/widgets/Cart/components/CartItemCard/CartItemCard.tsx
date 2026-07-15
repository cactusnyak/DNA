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
          'grid gap-0 rounded-2xl border border-border bg-card sm:grid-cols-[120px_minmax(0,1fr)]',
          className,
        )}
      >
        <div className="border-b border-border p-3 sm:border-b-0 sm:border-r">
          <div className="aspect-square max-h-32 overflow-hidden rounded-sm bg-muted sm:max-h-none">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={imageAlt ?? title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
                {placeholderText}
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 space-y-4 p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <h3 className="line-clamp-2 font-semibold">
                {title}
              </h3>

              {category}
            </div>

            <div className="shrink-0 text-left sm:text-right">
              {price}
              {priceMeta && (
                <p className="text-xs text-muted-foreground">{priceMeta}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            {actions}

            <div className="flex items-center gap-2">
              {favouriteButton}

              <Button
                type="button"
                variant="destructive"
                size="icon"
                aria-label="Удалить"
                onClick={(e) => {
                  e.stopPropagation();
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