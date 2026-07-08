import { Link } from 'react-router-dom';

import { FavouriteButton } from '@/entities/favourite';
import type { Product } from '@/entities/product';
import {
  getPlatformProductHref,
  type PlatformSectionId,
} from '@/shared/platform';
import { ProductActions } from '@/widgets/ProductActions';

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
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-card p-1 transition-colors hover:bg-muted/40">
      <Link
        to={getPlatformProductHref(product.id)}
        aria-label={`Открыть товар ${product.title}`}
        className="absolute inset-0 z-10"
      />

      <div className="relative z-0">
        <ProductGallery images={product.images} title={product.title} />

        <div className="absolute right-2 top-2 z-20">
          <FavouriteButton item={{ productId: product.id }} />
        </div>
      </div>

      <div className="relative z-0">
        <ProductCardContent
          section={section}
          product={product}
          currentCategorySlug={currentCategorySlug}
        />
      </div>

      {(showAddToCartButton || showBuyNowButton) && (
        <div className="relative z-20 mt-auto p-4 pt-0">
          <ProductActions
            product={product}
            variant="card"
            showAddToCartButton={showAddToCartButton}
            showBuyNowButton={showBuyNowButton}
          />
        </div>
      )}
    </article>
  );
}
