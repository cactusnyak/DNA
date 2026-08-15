import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { getProduct } from '@/entities/product/api/get-product';
import { ProductDetails } from '@/widgets/ProductDetails';

export function ProductPage() {
  const { productSlug } = useParams();

  const {
    data: product,
    isPending,
    error,
  } = useQuery({
    queryKey: ['product', productSlug],
    queryFn: () => getProduct(productSlug ?? ''),
    enabled: Boolean(productSlug),
  });

  if (!productSlug) {
    return <ErrorMessage>Товар не найден</ErrorMessage>;
  }

  if (isPending) {
    return (
      <SkeletonLoader
        itemClassName="min-h-[32rem]"
        ariaLabel="Загружаем товар"
      />
    );
  }

  if (error || !product) {
    return <ErrorMessage>Не удалось загрузить товар</ErrorMessage>;
  }

  return <ProductDetails key={product.id} product={product} />;
}
