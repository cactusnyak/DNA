import { Link } from 'react-router-dom';

import { FavouriteButton } from '@/entities/favourite';
import type { Product } from '@/entities/product';
import { getPlatformProductHref, PLATFORM_SECTION } from '@/shared/platform';
import { ItemGallery } from '@/shared/ui/ItemGallery';
import { ProductCardContent } from '@/widgets/Catalog/components/ProductGrid/components/ProductCard/components/ProductCardContent';
import { ItemActions } from '@/widgets/ItemActions';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      to={getPlatformProductHref(product.id)}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-card p-1 transition-colors hover:bg-muted/40"
    >
      <div className="relative">
        <ItemGallery images={product.images} title={product.title} />

        <div
          className="absolute right-2 top-2 z-10"
          onClick={(e) => e.preventDefault()}
        >
          <FavouriteButton item={{ productId: product.id }} />
        </div>
      </div>

      <ProductCardContent
        section={PLATFORM_SECTION.MARKET}
        product={product}
      />

      <div
        className="relative z-10 mt-auto p-4 pt-0"
        onClick={(e) => e.preventDefault()}
      >
        <ItemActions itemType="product" item={product} variant="card" />
      </div>
    </Link>
  );
}
