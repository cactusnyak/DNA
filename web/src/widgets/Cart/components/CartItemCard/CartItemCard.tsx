import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`Открыть ${title}`}
      className={[
        'flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-page shadow-card-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:grid sm:grid-cols-[120px_minmax(0,1fr)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={() => navigate(href)}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        navigate(href);
      }}
    >
        <div className="p-2 sm:p-3">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted/50 sm:aspect-[4/5]">
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
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="flex min-w-0 flex-col gap-1">
              <h3 className="line-clamp-2 text-sm font-semibold leading-5 sm:text-base">
                {title}
              </h3>

              {category}
            </div>

            <div className="flex shrink-0 flex-col gap-0.5 text-left sm:text-right">
              {price}

              {priceMeta && (
                <p className="text-xs text-muted-foreground">
                  {priceMeta}
                </p>
              )}
            </div>
          </div>

          <div
            className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            {actions}

            <div className="flex shrink-0 items-center justify-end gap-1 self-end">
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
  );
}
