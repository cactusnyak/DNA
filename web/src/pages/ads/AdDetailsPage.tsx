import { useParams } from 'react-router-dom';

import { AdDetails } from '@/widgets/AdDetails';

export function AdDetailsPage() {
  const { adId } = useParams();

  if (!adId) {
    return (
      <p className="text-sm text-muted-foreground">Объявление не найдено.</p>
    );
  }

  return <AdDetails adId={adId} />;
}
