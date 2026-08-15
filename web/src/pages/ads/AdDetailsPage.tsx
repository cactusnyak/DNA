import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
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
      <SkeletonLoader
        itemClassName="min-h-[32rem]"
        ariaLabel="Загружаем объявление"
      />
    );
  }

  if (isError || !ad) {
    return (
      <ErrorMessage>
        Объявление не найдено или недоступно.
      </ErrorMessage>
    );
  }

  return <AdDetails ad={ad} />;
}
