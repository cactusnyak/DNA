import type { UIEvent } from 'react';

import type { Product } from '@/entities/product';

import { GlobalSearchProductRow } from '../GlobalSearchProductRow';

type GlobalSearchProductResultsProps = {
  products: Product[];
  totalProducts: number;
  searchValue: string;
  isPending?: boolean;
  isError?: boolean;
  hasMoreProducts?: boolean;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
  onNavigate: () => void;
};

export function GlobalSearchProductResults({
  products,
  totalProducts,
  searchValue,
  isPending = false,
  isError = false,
  hasMoreProducts = false,
  onScroll,
  onNavigate,
}: GlobalSearchProductResultsProps) {
  return (
    <section className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Товары</h3>

        <span className="text-xs text-muted-foreground">
          {totalProducts}
        </span>
      </div>

      <div
        className="mt-3 max-h-80 overflow-y-auto pr-1"
        onScroll={onScroll}
      >
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
                searchValue={searchValue}
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
      </div>
    </section>
  );
}
