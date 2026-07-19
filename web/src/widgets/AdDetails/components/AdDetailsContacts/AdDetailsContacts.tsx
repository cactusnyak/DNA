import type { Ad } from '@/entities/ad';
import { LinkifyText } from '@/shared/utils/linkify';

type AdDetailsContactsProps = {
  ad: Ad;
};

const contactBadgeClass =
  'inline items-center rounded-md bg-muted/60 px-3 py-1.5 text-sm font-medium text-foreground transition-colors';

function getContactValues(ad: Ad): string[] {
  return [
    ad.contactPhone,
    ad.contactTelegram,
    ad.contactEmail,
    ad.contactOther,
  ].filter((value): value is string => Boolean(value));
}

export function AdDetailsContacts({ ad }: AdDetailsContactsProps) {
  const sellerName = ad.seller?.nickname ?? 'Продавец';

  const contactValues = getContactValues(ad);

  return (
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
  );
}
