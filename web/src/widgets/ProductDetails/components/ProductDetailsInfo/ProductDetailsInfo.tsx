import { Link } from 'react-router-dom';

import { SectionHeader } from '@/components/ui/Section';
import type { Product } from '@/entities/product';
import { formatPrice } from '@/shared/utils/format-price';

type ProductDetailsInfoProps = {
  product: Product;
};

export function ProductDetailsInfo({ product }: ProductDetailsInfoProps) {
  return (
    <div className="space-y-6">
      <SectionHeader title={product.title} description={product.description} />

      <div className="space-y-2">
        <p className="text-3xl font-semibold">
          {formatPrice(product.price)}
        </p>

        <Link
          to={`/catalog/${product.category.path ?? product.category.slug}`}
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {product.category.name}
        </Link>
      </div>
    </div>
  );
}