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
  const isAdsSection = section === PLATFORM_SECTION.ADS;
  const sourceItems = isAdsSection ? ads : products;
  const items = sourceItems.slice(0, 12).map((item) => ({
    id: item.id,
    title: item.title,
    image: item.images[0],
    price: item.price,
    to: isAdsSection
      ? `/ads/ad/${item.slug}`
      : getPlatformProductHref(item.slug),
  }));

  return (
    <aside className="min-w-0 overflow-y-auto p-4">
      <p className="mb-3 text-sm font-medium">
        {isAdsSection
          ? activeCategoryName
            ? `Объявления категории «${activeCategoryName}»`
            : 'Объявления доски'
          : activeCategoryName
            ? `Товары категории «${activeCategoryName}»`
            : 'Все товары'}
      </p>

      {isPending && (
        <p className="text-sm text-muted-foreground">
          {isAdsSection ? 'Загрузка объявлений...' : 'Загрузка товаров...'}
        </p>
      )}

      {!isPending && !items.length && (
        <p className="text-sm text-muted-foreground">
          {isAdsSection ? 'Объявления не найдены.' : 'Товары не найдены.'}
        </p>
      )}

      {!!items.length && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <Link
              key={item.id}
              to={item.to}
              onClick={onProductClick}
              className="group overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-foreground/30"
            >
              <div className="aspect-square overflow-hidden bg-muted">
                {item.image && (
                  <img
                    src={item.image.url}
                    alt={item.image.alt ?? item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </div>

              <div className="p-1.5 space-y-0.5">
                <p className="line-clamp-2 text-[11px] font-medium leading-snug">
                  {item.title}
                </p>
                {item.price != null && (
                  <p className="text-[11px] text-muted-foreground">
                    {formatPrice(item.price)}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </aside>
  );
}
