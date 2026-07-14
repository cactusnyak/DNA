import { useQuery } from '@tanstack/react-query';

import { getAd } from '@/entities/ad';
import { Gallery } from '@/widgets/Gallery';
import { formatPrice } from '@/shared/utils/format-price';
import { LinkifyText } from '@/shared/utils/linkify';

import { AdDetailsActions } from './components/AdDetailsActions';

type AdDetailsProps = {
  adId: string;
};

const contactBadgeClass =
  'inline items-center rounded-md bg-muted/60 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted';

function getContactValues(ad: {
  contactPhone?: string;
  contactTelegram?: string;
  contactEmail?: string;
  contactOther?: string;
}): string[] {
  return [
    ad.contactPhone,
    ad.contactTelegram,
    ad.contactEmail,
    ad.contactOther,
  ].filter((value): value is string => Boolean(value));
}

export function AdDetails({ adId }: AdDetailsProps) {
  const {
    data: ad,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['ad', adId],
    queryFn: () => getAd(adId),
  });

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

  const sellerName = ad.seller
    ? `${ad.seller.firstName} ${ad.seller.lastName}`.trim()
    : 'Продавец';

  const contactValues = getContactValues(ad);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <Gallery images={ad.images} title={ad.title} />

      <div className="flex flex-col gap-6">
        <div>
          <div className="flex flex-col gap-2">
            {ad.category && (
              <p className="text-sm text-muted-foreground">{ad.category.name}</p>
            )}
            <h1 className="text-2xl font-semibold">{ad.title}</h1>
            <p className="text-3xl font-semibold">{formatPrice(ad.price)}</p>
          </div>

          {ad.description && (
            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-muted-foreground">
                Описание
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed">
                {ad.description}
              </p>
            </div>
          )}
        </div>

        <AdDetailsActions ad={ad} />

        <div className="flex flex-col gap-2.5">
          <span className="font-semibold">{sellerName}</span>

          {contactValues.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {contactValues.map((value, index) => (
                <span key={index} className={contactBadgeClass}>
                  <LinkifyText text={value} />
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Контакты появятся позже.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
