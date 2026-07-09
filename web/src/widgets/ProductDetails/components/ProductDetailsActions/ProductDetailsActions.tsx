import type { Product } from '@/entities/product';
import { FavouriteButton } from '@/entities/favourite';
import { ProductActions } from '@/widgets/ProductActions';

type ProductDetailsActionsProps = {
  product: Product;
};

export function ProductDetailsActions({ product }: ProductDetailsActionsProps) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex-1">
        <ProductActions product={product} variant="details" />
      </div>

      <FavouriteButton
        item={{ productId: product.id }}
        className="size-10 shrink-0 rounded-xl border border-border"
      />
    </div>
  );
}