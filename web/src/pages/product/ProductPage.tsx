import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import { getProduct } from '@/entities/product/api/get-product';
import { ProductDetails } from '@/widgets/ProductDetails';

export function ProductPage() {
  const { productId } = useParams();

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

  return <ProductDetails product={product} />;
}