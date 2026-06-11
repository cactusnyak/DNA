import type { Product } from '@/entities/product';

import { ProductDetailsActions } from './components/ProductDetailsActions';
import { ProductDetailsGallery } from './components/ProductDetailsGallery';
import { ProductDetailsInfo } from './components/ProductDetailsInfo';

type ProductDetailsProps = {
  product: Product;
};

export function ProductDetails({ product }: ProductDetailsProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
      <ProductDetailsGallery images={product.images} title={product.title} />

      <section className="space-y-6">
        <ProductDetailsInfo product={product} />
        <ProductDetailsActions product={product} />
      </section>
    </div>
  );
}