import type { UIEvent } from 'react';

import type { Ad } from '@/entities/ad';

import { GlobalSearchAdRow } from '../GlobalSearchAdRow';

type GlobalSearchAdResultsProps = {
  ads: Ad[];
  totalAds: number;
  searchValue: string;
  isPending?: boolean;
  isError?: boolean;
  hasMoreAds?: boolean;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
  onNavigate: () => void;
};

export function GlobalSearchAdResults({
  ads,
  totalAds,
  searchValue,
  isPending = false,
  isError = false,
  hasMoreAds = false,
  onScroll,
  onNavigate,
}: GlobalSearchAdResultsProps) {
  return (
    <section className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Объявления</h3>

        <span className="text-xs text-muted-foreground">{totalAds}</span>
      </div>

      <div
        className="mt-3 max-h-80 overflow-y-auto pr-1"
        onScroll={onScroll}
      >
        {isPending && (
          <p className="rounded-lg bg-muted/40 px-3 py-3 text-sm text-muted-foreground">
            Ищем объявления...
          </p>
        )}

        {isError && (
          <p className="rounded-lg bg-destructive/10 px-3 py-3 text-sm text-destructive">
            Не удалось загрузить объявления.
          </p>
        )}

        {!isPending && !isError && ads.length === 0 && (
          <p className="rounded-lg bg-muted/40 px-3 py-3 text-sm text-muted-foreground">
            Объявления не найдены.
          </p>
        )}

        {!isPending && !isError && ads.length > 0 && (
          <div className="grid gap-1">
            {ads.map((ad) => (
              <GlobalSearchAdRow
                key={ad.id}
                ad={ad}
                searchValue={searchValue}
                onNavigate={onNavigate}
              />
            ))}

            {hasMoreAds && (
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
