import type { UIEvent } from 'react';

import type { Product } from '@/entities/product';
import {
  PLATFORM_SECTION,
  type PlatformSectionId,
} from '@/shared/platform';

import { GlobalSearchProductRow } from '../GlobalSearchProductRow';

type GlobalSearchProductResultsProps = {
  section: PlatformSectionId;
  products: Product[];
  totalProducts: number;
  isPending?: boolean;
  isError?: boolean;
  hasMoreProducts?: boolean;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
  onNavigate: () => void;
};

export function GlobalSearchProductResults({
  section,
  products,
  totalProducts,
  isPending = false,
  isError = false,
  hasMoreProducts = false,
  onScroll,
  onNavigate,
}: GlobalSearchProductResultsProps) {
  const isAdsSection = section === PLATFORM_SECTION.ADS;

  return (
    <section className="p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">
          {isAdsSection ? 'Объявления' : 'Товары'}
        </h3>

        <span className="text-xs text-muted-foreground">
          {totalProducts}
        </span>
      </div>

      <div
        className="mt-3 max-h-80 overflow-y-auto pr-1"
        onScroll={onScroll}
      >
        {isAdsSection ? (
          <p className="rounded-lg bg-muted/40 px-3 py-3 text-sm text-muted-foreground">
            Поиск объявлений появится после модели доски.
          </p>
        ) : (
          <>
            {isPending && (
              <p className="rounded-lg bg-muted/40 px-3 py-3 text-sm text-muted-foreground">
                Ищем товары...
              </p>
            )}

            {isError && (
              <p className="rounded-lg bg-destructive/10 px-3 py-3 text-sm text-destructive">
                Не удалось загрузить товары.
              </p>
            )}

            {!isPending && !isError && products.length === 0 && (
              <p className="rounded-lg bg-muted/40 px-3 py-3 text-sm text-muted-foreground">
                Товары не найдены.
              </p>
            )}

            {!isPending && !isError && products.length > 0 && (
              <div className="grid gap-1">
                {products.map((product) => (
                  <GlobalSearchProductRow
                    key={product.id}
                    product={product}
                    onNavigate={onNavigate}
                  />
                ))}

                {hasMoreProducts && (
                  <p className="py-2 text-center text-xs text-muted-foreground">
                    Прокрутите ниже, чтобы показать ещё.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
