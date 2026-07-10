import { useQuery } from '@tanstack/react-query';

import { getAds } from '@/entities/ad';

import { AdCard } from './components/AdCard';

type AdsListingProps = {
  categorySlug?: string;
  emptyText?: string;
};

export function AdsListing({
  categorySlug,
  emptyText = 'Объявления пока не размещены.',
}: AdsListingProps) {
  const {
    data: ads = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ['ads', { categorySlug: categorySlug ?? null }],
    queryFn: () => getAds({ categorySlug }),
  });

  if (isPending) {
    return (
      <p className="text-sm text-muted-foreground">Загружаем объявления...</p>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-destructive/20 p-5">
        <p className="text-sm text-destructive">
          Не удалось загрузить объявления.
        </p>
      </div>
    );
  }

  if (!ads.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {ads.map((ad) => (
        <AdCard key={ad.id} ad={ad} currentCategorySlug={categorySlug} />
      ))}
    </div>
  );
}
