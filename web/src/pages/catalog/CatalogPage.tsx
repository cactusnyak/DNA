import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/entities/product/api/get-products';

export function CatalogPage() {
  const {
    data: products,
    isPending,
    error,
  } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts(),
  });

  if (isPending) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Каталог</h1>
        <p className="text-muted-foreground">Загрузка товаров...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Каталог</h1>
        <p className="text-destructive">
          Не удалось загрузить товары
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Каталог</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products?.map((product) => (
          <article
            key={product.id}
            className="overflow-hidden rounded-lg border border-border bg-card"
          >
            <img
              src={product.images[0]?.url}
              alt={product.images[0]?.alt ?? product.title}
              className="aspect-square w-full object-cover"
            />

            <div className="space-y-2 p-4">
              <h2 className="line-clamp-2 font-medium">
                {product.title}
              </h2>

              <p className="line-clamp-3 text-sm text-muted-foreground">
                {product.description}
              </p>

              <p className="text-lg font-semibold">
                {product.price.toLocaleString('ru-RU')} ₽
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}