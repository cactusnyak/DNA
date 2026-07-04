import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getAd } from '@/entities/ad';
import { formatPrice } from '@/shared/utils/format-price';

type AdDetailsProps = {
  adId: string;
};

export function AdDetails({ adId }: AdDetailsProps) {
  const {
    data: ad,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['ad', adId],
    queryFn: () => getAd(adId),
  });

  const [activeImageIndex, setActiveImageIndex] = useState(0);

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

  const activeImage = ad.images[activeImageIndex] ?? ad.images[0];
  const sellerName = ad.seller
    ? `${ad.seller.firstName} ${ad.seller.lastName}`.trim()
    : 'Продавец';

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted">
          {activeImage ? (
            <img
              src={activeImage.url}
              alt={activeImage.alt ?? ad.title}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
              Нет фото
            </div>
          )}
        </div>

        {ad.images.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {ad.images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                className={`size-16 overflow-hidden rounded-xl border ${
                  index === activeImageIndex
                    ? 'border-foreground'
                    : 'border-border'
                }`}
                onClick={() => setActiveImageIndex(index)}
              >
                <img
                  src={image.url}
                  alt={image.alt ?? ad.title}
                  className="size-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          {ad.category && (
            <p className="text-sm text-muted-foreground">{ad.category.name}</p>
          )}
          <h1 className="text-2xl font-semibold">{ad.title}</h1>
          <p className="text-3xl font-semibold">{formatPrice(ad.price)}</p>
        </div>

        {ad.description && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Описание
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed">
              {ad.description}
            </p>
          </div>
        )}

        <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Продавец
          </h2>
          <p className="font-semibold">{sellerName}</p>

          {ad.seller?.phone ? (
            <a
              href={`tel:${ad.seller.phone}`}
              className="inline-flex text-sm font-medium text-foreground underline underline-offset-4"
            >
              {ad.seller.phone}
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">
              Контакты появятся позже.
            </p>
          )}

          {ad.seller?.email && (
            <a
              href={`mailto:${ad.seller.email}`}
              className="block text-sm text-muted-foreground underline underline-offset-4"
            >
              {ad.seller.email}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
