import { Link } from 'react-router-dom';

import { FavouriteButton } from '@/entities/favourite';
import type { Product } from '@/entities/product';
import {
  getPlatformProductHref,
  type PlatformSectionId,
} from '@/shared/platform';
import { ItemActions } from '@/widgets/ItemActions';

import { ProductCardContent } from './components/ProductCardContent';
import { ProductGallery } from './components/ProductGallery';

type ProductCardProps = {
  section: PlatformSectionId;
  product: Product;
  currentCategorySlug?: string;
  showAddToCartButton?: boolean;
  showBuyNowButton?: boolean;
};

export function ProductCard({
  section,
  product,
  currentCategorySlug,
  showAddToCartButton = true,
  showBuyNowButton = true,
}: ProductCardProps) {
  return (
    <Link
      to={getPlatformProductHref(product.id)}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-card p-1 transition-colors hover:bg-muted/40"
    >
      <div className="relative">
        <ProductGallery images={product.images} title={product.title} />

        <div
          className="absolute right-2 top-2 z-10"
          onClick={(e) => e.preventDefault()}
        >
          <FavouriteButton item={{ productId: product.id }} />
        </div>
      </div>

      <ProductCardContent
        section={section}
        product={product}
        currentCategorySlug={currentCategorySlug}
      />

      {(showAddToCartButton || showBuyNowButton) && (
        <div
          className="relative z-10 mt-auto p-4 pt-0"
          onClick={(e) => e.preventDefault()}
        >
          <ItemActions
            itemType="product"
            item={product}
            variant="card"
            showAddToCartButton={showAddToCartButton}
            showBuyNowButton={showBuyNowButton}
          />
        </div>
      )}
    </Link>
  );
}
