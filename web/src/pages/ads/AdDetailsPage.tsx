import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import { getAd } from '@/entities/ad';
import { AdDetails } from '@/widgets/AdDetails';

export function AdDetailsPage() {
  const { adSlug } = useParams();

  const {
    data: ad,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['ad', adSlug],
    queryFn: () => getAd(adSlug ?? ''),
    enabled: Boolean(adSlug),
  });

  if (!adSlug) {
    return (
      <p className="text-sm text-muted-foreground">Объявление не найдено.</p>
    );
  }

  if (isPending) {
    return (
      <p className="text-sm text-muted-foreground">Загружаем объявление...</p>
    );
  }

  if (isError || !ad) {
    return (
      <div className="rounded-2xl border border-destructive/20 p-5">
        <p className="text-sm text-destructive">
          Объявление не найдено или недоступно.
        </p>
      </div>
    );
  }

  return <AdDetails ad={ad} />;
}
