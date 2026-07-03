import { Link } from 'react-router-dom';

import type { Product } from '@/entities/product';
import {
  DEFAULT_PLATFORM_SECTION_ID,
  getPlatformProductHref,
  type PlatformSectionId,
} from '@/shared/platform';
import { ProductActions } from '@/widgets/ProductActions';

import { ProductCardContent } from './components/ProductCardContent';
import { ProductGallery } from './components/ProductGallery';

type ProductCardProps = {
  section?: PlatformSectionId;
  product: Product;
  currentCategorySlug?: string;
  showAddToCartButton?: boolean;
  showBuyNowButton?: boolean;
};

export function ProductCard({
  section = DEFAULT_PLATFORM_SECTION_ID,
  product,
  currentCategorySlug,
  showAddToCartButton = true,
  showBuyNowButton = true,
}: ProductCardProps) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden p-1 rounded-xl bg-card transition-colors hover:bg-muted/40">
      <Link
        to={getPlatformProductHref(product.id)}
        aria-label={`Открыть товар ${product.title}`}
        className="absolute inset-0 z-10"
      />

      <div className="relative z-0">
        <ProductGallery images={product.images} title={product.title} />
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
