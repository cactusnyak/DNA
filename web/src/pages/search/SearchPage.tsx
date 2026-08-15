import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import { ContentCard } from '@/components/ui/ContentCard';
import { getFeed } from '@/entities/feed';
import { getCatalogCategories } from '@/shared/catalog';
import { PLATFORM_SECTION } from '@/shared/platform';

import { AuxiliaryResults } from './components/AuxiliaryResults';
import { SearchListings } from './components/SearchListings';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q')?.trim() ?? '';

  const {
    data: feedItems = [],
    isPending: isFeedPending,
    isError: isFeedError,
  } = useQuery({
    queryKey: ['search-feed'],
    queryFn: getFeed,
    enabled: Boolean(query),
  });
  const { data: marketCategories = [] } = useQuery({
    queryKey: ['global-search-categories', PLATFORM_SECTION.MARKET],
    queryFn: () => getCatalogCategories({ section: PLATFORM_SECTION.MARKET }),
    enabled: Boolean(query),
  });
  const { data: adsCategories = [] } = useQuery({
    queryKey: ['global-search-categories', PLATFORM_SECTION.ADS],
    queryFn: () => getCatalogCategories({ section: PLATFORM_SECTION.ADS }),
    enabled: Boolean(query),
  });

  if (!query) {
    return (
      <div className="rounded-2xl border border-dashed border-primary/12 p-8 text-center">
        <h1 className="text-2xl font-semibold">Поиск</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Введите поисковый запрос в строке поиска.
        </p>
      </div>
    );
  }

  return (
    <ContentCard>
      <header>
        <h1 className="text-2xl font-semibold">
          Поиск по запросу «{query}»
        </h1>
      </header>

      <AuxiliaryResults
        query={query}
        marketCategories={marketCategories}
        adsCategories={adsCategories}
      />

      {isFeedPending ? (
        <p className="text-sm text-muted-foreground">
          Ищем объявления и товары...
        </p>
      ) : isFeedError ? (
        <p className="text-sm text-destructive">
          Не удалось загрузить результаты поиска.
        </p>
      ) : (
        <SearchListings key={query} items={feedItems} query={query} />
      )}
    </ContentCard>
  );
}
