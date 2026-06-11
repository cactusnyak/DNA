import type { Product } from '@/entities/product';
import { ProductActions } from '@/widgets/ProductActions';

type ProductDetailsActionsProps = {
  product: Product;
};

export function ProductDetailsActions({ product }: ProductDetailsActionsProps) {
  return <ProductActions product={product} variant="details" />;
}