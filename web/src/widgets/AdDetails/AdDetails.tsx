import { useQuery } from '@tanstack/react-query';

import { getAd } from '@/entities/ad';
import { Gallery } from '@/widgets/Gallery';
import { formatPrice } from '@/shared/utils/format-price';

import { AdDetailsActions } from './components/AdDetailsActions';

type AdDetailsProps = {
  adId: string;
};

type ContactItem = {
  value: string;
  href?: string;
  external?: boolean;
};

function getContactItems(ad: {
  contactPhone?: string;
  contactTelegram?: string;
  contactEmail?: string;
  contactOther?: string;
}): ContactItem[] {
  const items: ContactItem[] = [];

  if (ad.contactPhone) {
    items.push({ value: ad.contactPhone, href: `tel:${ad.contactPhone}` });
  }
  if (ad.contactTelegram) {
    items.push({
      value: ad.contactTelegram,
      href: `https://t.me/${ad.contactTelegram.replace(/^@/, '')}`,
      external: true,
    });
  }
  if (ad.contactEmail) {
    items.push({ value: ad.contactEmail, href: `mailto:${ad.contactEmail}` });
  }
  if (ad.contactOther) {
    items.push({ value: ad.contactOther });
  }

  return items;
}

const contactBadgeClass =
  'inline-flex items-center rounded-md bg-muted/60 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted';

function ContactBadge({ item }: { item: ContactItem }) {
  if (item.href) {
    return (
      <a
        href={item.href}
        className={contactBadgeClass}
        {...(item.external && { target: '_blank', rel: 'noopener noreferrer' })}
      >
        {item.value}
      </a>
    );
  }

  return <span className={contactBadgeClass}>{item.value}</span>;
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

  const contactItems = getContactItems(ad);

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

          {contactItems.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {contactItems.map((item, index) => (
                <ContactBadge key={index} item={item} />
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
