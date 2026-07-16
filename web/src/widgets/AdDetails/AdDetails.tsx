import type { Ad } from '@/entities/ad';
import { Gallery } from '@/widgets/Gallery';

import { AdDetailsActions } from './components/AdDetailsActions';
import { AdDetailsContacts } from './components/AdDetailsContacts';
import { AdDetailsInfo } from './components/AdDetailsInfo';

type AdDetailsProps = {
  ad: Ad;
};

export function AdDetails({ ad }: AdDetailsProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <Gallery images={ad.images} title={ad.title} />

      <div className="space-y-8">
        <AdDetailsInfo ad={ad} />
        <AdDetailsActions ad={ad} />
        <AdDetailsContacts ad={ad} />
      </div>
    </div>
  );
}
