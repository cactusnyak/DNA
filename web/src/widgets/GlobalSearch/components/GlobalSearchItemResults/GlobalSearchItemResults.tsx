import type { UIEvent } from 'react';

import type { Ad } from '@/entities/ad';
import type { Product } from '@/entities/product';

import { GlobalSearchAdRow } from '../GlobalSearchAdRow';
import { GlobalSearchProductRow } from '../GlobalSearchProductRow';

type GlobalSearchItemResultsProps = {
  products: Product[];
  totalProducts: number;
  ads: Ad[];
  totalAds: number;
  searchValue: string;
  isPending?: boolean;
  isError?: boolean;
  hasMore?: boolean;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
  onNavigate: () => void;
};

export function GlobalSearchItemResults({
  products,
  totalProducts,
  ads,
  totalAds,
  searchValue,
  isPending = false,
  isError = false,
  hasMore = false,
  onScroll,
  onNavigate,
}: GlobalSearchItemResultsProps) {
  const totalItems = totalProducts + totalAds;
  const hasResults = products.length > 0 || ads.length > 0;

  return (
    <section className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Предложения</h3>
        <span className="text-xs text-muted-foreground">{totalItems}</span>
      </div>

      <div className="max-h-80 overflow-y-auto pr-1" onScroll={onScroll}>
        {isPending && (
          <p className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
            Ищем предложения...
          </p>
        )}

        {isError && (
          <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            Не удалось загрузить предложения.
          </p>
        )}

        {!isPending && !isError && !hasResults && (
          <p className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
            Предложения не найдены.
          </p>
        )}

        {!isPending && !isError && hasResults && (
          <div className="grid gap-1">
            {products.map((product) => (
              <GlobalSearchProductRow
                key={`product-${product.id}`}
                product={product}
                searchValue={searchValue}
                onNavigate={onNavigate}
              />
            ))}

            {ads.map((ad) => (
              <GlobalSearchAdRow
                key={`ad-${ad.id}`}
                ad={ad}
                searchValue={searchValue}
                onNavigate={onNavigate}
              />
            ))}

            {hasMore && (
              <p className="py-2 text-center text-xs text-muted-foreground">
                Прокрутите ниже, чтобы показать ещё.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
