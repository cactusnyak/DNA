import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import type { Ad } from '@/entities/ad';
import { LinkifyText } from '@/shared/utils/linkify';
import { cn } from '@/shared/utils/cn';
import { Modal } from '@/widgets/Modal';
import {
  getProductActionHeightClass,
  type ProductQuantityCounterVariant,
} from '@/widgets/ProductQuantityCounter';

type SellerContactsButtonProps = {
  ad: Ad;
  variant?: ProductQuantityCounterVariant;
};

const contactBadgeClass =
  'rounded-md bg-muted/60 px-3 py-1.5 text-sm font-medium text-foreground';

function getContactValues(ad: Ad): string[] {
  return [
    ad.contactPhone,
    ad.contactTelegram,
    ad.contactEmail,
    ad.contactOther,
  ].filter((value): value is string => Boolean(value));
}

export function SellerContactsButton({
  ad,
  variant = 'card',
}: SellerContactsButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const sellerName = ad.seller
    ? `${ad.seller.firstName} ${ad.seller.lastName}`.trim()
    : 'Продавец';
  const contactValues = getContactValues(ad);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size={variant === 'details' ? 'lg' : 'default'}
        className={cn('w-full', getProductActionHeightClass(variant))}
        onClick={() => setIsModalOpen(true)}
      >
        Контакты продавца
      </Button>

      <Modal
        isOpen={isModalOpen}
        title={`${sellerName}`}
        size="sm"
        bodyClassName="overflow-y-auto p-5"
        onClose={() => setIsModalOpen(false)}
      >
        {contactValues.length > 0 ? (
          <div className="flex flex-col gap-2">
            {contactValues.map((value, index) => (
              <div key={`${value}-${index}`} className={contactBadgeClass}>
                <LinkifyText text={value} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Контакты появятся позже.
          </p>
        )}
      </Modal>
    </>
  );
}
