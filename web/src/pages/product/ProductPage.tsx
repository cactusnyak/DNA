import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/Section';
import { useCartStore } from '@/entities/cart';
import { getProduct } from '@/entities/product/api/get-product';
import { AddToCartButton } from '@/widgets/Catalog/components/ProductGrid/components/ProductCard/components/AddToCartButton';

export function ProductPage() {
  const { productId } = useParams();
  const addItem = useCartStore((state) => state.addItem);

  const {
    data: product,
    isPending,
    error,
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProduct(productId ?? ''),
    enabled: Boolean(productId),
  });

  if (!productId) {
    return <p className="text-destructive">Товар не найден</p>;
  }

  if (isPending) {
    return <p className="text-muted-foreground">Загрузка товара...</p>;
  }

  if (error || !product) {
    return <p className="text-destructive">Не удалось загрузить товар</p>;
  }

  const firstImage = product.images[0];

  function handleBuyNow() {
    addItem(product);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div className="overflow-hidden rounded-2xl bg-card">
        {firstImage ? (
          <img
            src={firstImage.url}
            alt={firstImage.alt ?? product.title}
            className="aspect-square w-full object-contain p-8"
          />
        ) : (
          <div className="flex aspect-square items-center justify-center bg-muted text-muted-foreground">
            Нет изображения
          </div>
        )}
      </div>

      <section className="space-y-6">
        <SectionHeader
          title={product.title}
          description={product.description}
        />

        <div className="space-y-2">
          <p className="text-3xl font-semibold">
            {product.price.toLocaleString('ru-RU')} ₽
          </p>

          <Link
            to={`/catalog/${product.category.path ?? product.category.slug}`}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {product.category.name}
          </Link>
        </div>

        <div className="space-y-3">
          <AddToCartButton product={product} />

          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={handleBuyNow}
          >
            Купить в 1 клик
          </Button>
        </div>
      </section>
    </div>
  );
}