import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/entities/auth';
import { getFavourites, useFavouriteStore } from '@/entities/favourite';
import { PLATFORM_SECTION } from '@/shared/platform';
import { getItemGridClasses } from '@/shared/utils/get-item-grid-classes';
import { SectionHeader } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { AdCard } from '@/widgets/AdsListing/components/AdCard';
import { ProductCard } from '@/widgets/Catalog/components/ProductGrid/components/ProductCard';

import { FavouritesEmptyState } from './FavouritesEmptyState';

type Tab = 'products' | 'ads';

export function FavouritesPage() {
  const [tab, setTab] = useState<Tab>('products');
  const accessToken = useAuthStore((state) => state.accessToken);
  const { guestItems } = useFavouriteStore();

  const { data: serverFavourites = [], isPending } = useQuery({
    queryKey: ['favourites', accessToken],
    queryFn: () => getFavourites(accessToken!),
    enabled: Boolean(accessToken),
  });

  const favourites = accessToken ? serverFavourites : [];
  const productFavourites = favourites.filter((f) => f.product);
  const adFavourites = favourites.filter((f) => f.ad);

  const guestProductItems = guestItems.filter((i) => i.productId);
  const guestAdItems = guestItems.filter((i) => i.adId);

  const productCount = accessToken
    ? productFavourites.length
    : guestProductItems.length;
  const adCount = accessToken ? adFavourites.length : guestAdItems.length;

  const isLoading = accessToken && isPending;

  if (!isLoading && productCount === 0 && adCount === 0) {
    return <FavouritesEmptyState />;
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Избранное"
        description="Сохранённые товары маркета и объявления доски."
      />

      <SegmentedControl
        options={[
          { value: 'ads', label: `Доска${adCount > 0 ? ` (${adCount})` : ''}` },
          { value: 'products', label: `Маркет${productCount > 0 ? ` (${productCount})` : ''}` },
        ]}
        value={tab}
        onChange={(v) => setTab(v as Tab)}
      />

      {!accessToken && (guestProductItems.length > 0 || guestAdItems.length > 0) && (
        <p className="rounded-xl border border-border px-4 py-3 text-sm text-muted-foreground">
          Вы не авторизованы — избранное сохранено локально.{' '}
          <Link to="/authorization" className="font-medium underline-offset-4 hover:underline">
            Войдите
          </Link>
          , чтобы перенести сохранённое в аккаунт и увидеть карточки.
        </p>
      )}

      {isLoading && (
        <p className="text-sm text-muted-foreground">Загружаем избранное...</p>
      )}

      {tab === 'products' && !isLoading && (
        <>
          {!accessToken && guestProductItems.length === 0 && (
            <EmptyState
              text="В избранном нет товаров."
              to="/market/catalog"
              linkLabel="Перейти в каталог"
            />
          )}

          {accessToken && productFavourites.length === 0 && (
            <EmptyState
              text="В избранном нет товаров."
              to="/market/catalog"
              linkLabel="Перейти в каталог"
            />
          )}

          {!accessToken && guestProductItems.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Товары сохранены на этом устройстве. Войдите, чтобы перенести их
              в аккаунт и увидеть карточки.
            </p>
          )}

          {accessToken && productFavourites.length > 0 && (
            <div className={getItemGridClasses()}>
              {productFavourites.map((fav) => (
                <ProductCard
                  key={fav.id}
                  section={PLATFORM_SECTION.MARKET}
                  product={fav.product!}
                />
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'ads' && !isLoading && (
        <>
          {!accessToken && guestAdItems.length === 0 && (
            <EmptyState
              text="В избранном нет объявлений."
              to="/ads/catalog"
              linkLabel="Перейти на доску"
            />
          )}

          {accessToken && adFavourites.length === 0 && (
            <EmptyState
              text="В избранном нет объявлений."
              to="/ads/catalog"
              linkLabel="Перейти на доску"
            />
          )}

          {!accessToken && guestAdItems.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Объявления сохранены на этом устройстве. Войдите, чтобы перенести
              их в аккаунт и увидеть карточки.
            </p>
          )}

          {accessToken && adFavourites.length > 0 && (
            <div className={getItemGridClasses()}>
              {adFavourites.map((fav) => (
                <AdCard key={fav.id} ad={fav.ad!} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EmptyState({
  text,
  to,
  linkLabel,
}: {
  text: string;
  to: string;
  linkLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-4">
      <p className="text-sm text-muted-foreground">{text}</p>
      <Button asChild variant="outline">
        <Link to={to}>{linkLabel}</Link>
      </Button>
    </div>
  );
}
