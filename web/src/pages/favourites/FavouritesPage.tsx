import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/entities/auth';
import { FavouriteButton, getFavourites, useFavouriteStore } from '@/entities/favourite';
import { formatPrice } from '@/shared/utils/format-price';
import { SectionHeader } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';

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

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Избранное"
        description="Сохранённые товары маркета и объявления доски."
      />

      <div className="flex gap-1 rounded-xl bg-muted p-1 w-fit">
        <button
          type="button"
          onClick={() => setTab('products')}
          className={[
            'rounded-lg px-4 py-1.5 text-sm font-medium transition-colors',
            tab === 'products'
              ? 'bg-background shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          ].join(' ')}
        >
          Товары {productCount > 0 && `(${productCount})`}
        </button>

        <button
          type="button"
          onClick={() => setTab('ads')}
          className={[
            'rounded-lg px-4 py-1.5 text-sm font-medium transition-colors',
            tab === 'ads'
              ? 'bg-background shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          ].join(' ')}
        >
          Объявления {adCount > 0 && `(${adCount})`}
        </button>
      </div>

      {!accessToken && (guestProductItems.length > 0 || guestAdItems.length > 0) && (
        <p className="rounded-xl border border-border px-4 py-3 text-sm text-muted-foreground">
          Вы не авторизованы — избранное сохранено локально.{' '}
          <Link to="/authorization" className="font-medium underline-offset-4 hover:underline">
            Войдите
          </Link>
          , чтобы синхронизировать его с аккаунтом.
        </p>
      )}

      {isPending && (
        <p className="text-sm text-muted-foreground">Загружаем избранное...</p>
      )}

      {tab === 'products' && !isPending && (
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
              Войдите в аккаунт, чтобы увидеть сохранённые товары здесь.
            </p>
          )}

          {accessToken && productFavourites.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {productFavourites.map((fav) => {
                const product = fav.product!;
                const cover = product.images?.[0];

                return (
                  <article
                    key={fav.id}
                    className="relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
                  >
                    <Link
                      to={`/market/product/${product.id}`}
                      className="aspect-[4/3] overflow-hidden bg-muted block"
                    >
                      {cover ? (
                        <img
                          src={cover.url}
                          alt={cover.alt ?? product.title}
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                          Нет фото
                        </div>
                      )}
                    </Link>

                    <div className="absolute right-2 top-2">
                      <FavouriteButton item={{ productId: product.id }} />
                    </div>

                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <Link
                        to={`/market/product/${product.id}`}
                        className="font-semibold line-clamp-2 hover:underline underline-offset-4"
                      >
                        {product.title}
                      </Link>
                      <p className="mt-auto text-lg font-semibold">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === 'ads' && !isPending && (
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
              Войдите в аккаунт, чтобы увидеть сохранённые объявления здесь.
            </p>
          )}

          {accessToken && adFavourites.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {adFavourites.map((fav) => {
                const ad = fav.ad!;
                const cover = ad.images?.[0];

                return (
                  <article
                    key={fav.id}
                    className="relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
                  >
                    <Link
                      to={`/ads/ad/${ad.id}`}
                      className="aspect-[4/3] overflow-hidden bg-muted block"
                    >
                      {cover ? (
                        <img
                          src={cover.url}
                          alt={cover.alt ?? ad.title}
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                          Нет фото
                        </div>
                      )}
                    </Link>

                    <div className="absolute right-2 top-2">
                      <FavouriteButton item={{ adId: ad.id }} />
                    </div>

                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <Link
                        to={`/ads/ad/${ad.id}`}
                        className="font-semibold line-clamp-2 hover:underline underline-offset-4"
                      >
                        {ad.title}
                      </Link>
                      <p className="mt-auto text-lg font-semibold">
                        {formatPrice(ad.price)}
                      </p>
                    </div>
                  </article>
                );
              })}
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
