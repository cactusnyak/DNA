import { Link } from 'react-router-dom';

import type { Ad } from '@/entities/ad';
import type { Product } from '@/entities/product';
import {
  PLATFORM_SECTION,
  getPlatformProductHref,
  type PlatformSectionId,
} from '@/shared/platform';
import { formatPrice } from '@/shared/utils/format-price';

type CatalogDropdownProductsProps = {
  section: PlatformSectionId;
  products: Product[];
  ads: Ad[];
  activeCategoryName?: string;
  isPending?: boolean;
  onProductClick?: () => void;
};

export function CatalogDropdownProducts({
  section,
  products,
  ads,
  activeCategoryName,
  isPending = false,
  onProductClick,
}: CatalogDropdownProductsProps) {
  if (section === PLATFORM_SECTION.ADS) {
    return (
      <aside className="min-w-0 overflow-y-auto p-4">
        <p className="mb-3 text-sm font-medium">
          {activeCategoryName
            ? `Объявления категории «${activeCategoryName}»`
            : 'Объявления доски'}
        </p>

        {isPending && (
          <p className="text-sm text-muted-foreground">Загрузка объявлений...</p>
        )}

        {!isPending && !ads.length && (
          <p className="text-sm text-muted-foreground">Объявления не найдены.</p>
        )}

        {!!ads.length && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
            {ads.slice(0, 12).map((ad) => {
              const image = ad.images[0];

              return (
                <Link
                  key={ad.id}
                  to={`/ads/ad/${ad.slug}`}
                  onClick={onProductClick}
                  className="group overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-foreground/30"
                >
                  <div className="aspect-square overflow-hidden bg-muted">
                    {image && (
                      <img
                        src={image.url}
                        alt={image.alt ?? ad.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    <p className="line-clamp-2 text-[11px] font-medium leading-snug">
                      {ad.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatPrice(ad.price)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </aside>
    );
  }

  return (
    <aside className="min-w-0 overflow-y-auto p-4">
      <p className="mb-3 text-sm font-medium">
        {activeCategoryName
          ? `Товары категории «${activeCategoryName}»`
          : 'Все товары'}
      </p>

      {isPending && (
        <p className="text-sm text-muted-foreground">Загрузка товаров...</p>
      )}

      {!isPending && !products.length && (
        <p className="text-sm text-muted-foreground">Товары не найдены.</p>
      )}

      {!!products.length && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
          {products.slice(0, 12).map((product) => {
            const image = product.images[0];

            return (
              <Link
                key={product.id}
                to={getPlatformProductHref(product.slug)}
                onClick={onProductClick}
                className="group overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-foreground/30"
              >
                <div className="aspect-square overflow-hidden bg-muted">
                  {image && (
                    <img
                      src={image.url}
                      alt={image.alt ?? product.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </div>

                <div className="p-1.5">
                  <p className="line-clamp-2 text-[11px] font-medium leading-snug">
                    {product.title}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </aside>
  );
}
