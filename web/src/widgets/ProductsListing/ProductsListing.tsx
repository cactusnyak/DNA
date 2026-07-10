import { useQuery } from '@tanstack/react-query';

import { getProducts } from '@/entities/product/api/get-products';
import { PLATFORM_SECTION } from '@/shared/platform';

import { ProductCard } from './components/ProductCard';

type ProductsListingProps = {
  categorySlug?: string;
  emptyText?: string;
};

export function ProductsListing({
  categorySlug,
  emptyText = 'Товары пока не добавлены.',
}: ProductsListingProps) {
  const {
    data: products = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ['products', { section: PLATFORM_SECTION.MARKET, categorySlug: categorySlug ?? null }],
    queryFn: () =>
      getProducts({ section: PLATFORM_SECTION.MARKET, categorySlug }),
  });

  if (isPending) {
    return (
      <p className="text-sm text-muted-foreground">Загружаем товары...</p>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-destructive/20 p-5">
        <p className="text-sm text-destructive">
          Не удалось загрузить товары.
        </p>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
