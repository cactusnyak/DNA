import { useNavigate } from 'react-router-dom';

import type { Product } from '@/entities/product';
import {
  getPlatformCategoryHref,
  type PlatformSectionId,
} from '@/shared/platform';
import { formatPrice } from '@/shared/utils/format-price';
import { OversizedIndicator } from '@/components/OversizedIndicator/OversizedIndicator';

type ProductCardContentProps = {
  section: PlatformSectionId;
  product: Product;
  currentCategorySlug?: string;
  showAdditionsSummary?: boolean;
};

export function ProductCardContent({
  section,
  product,
  currentCategorySlug,
  showAdditionsSummary = false,
}: ProductCardContentProps) {
  const navigate = useNavigate();
  const categoryHref = product.category
    ? getPlatformCategoryHref(
        section,
        product.category.path ?? product.category.slug,
      )
    : null;
  const shouldShowCategoryLink =
    !!categoryHref &&
    (!currentCategorySlug || currentCategorySlug !== product.category?.slug);

  return (
    <div className="flex flex-1 flex-col p-2">
      <p className="text-xl font-bold">{formatPrice(product.price)}</p>

      <div className="mt-2">
        <h3 className="line-clamp-2 font-semibold">{product.title}</h3>
        {product.isOversized && <OversizedIndicator className="mt-2" />}

        {showAdditionsSummary && (product.additions?.length ?? 0) > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            <p>Есть дополнения: {product.additions.length}</p>
            {product.additions.slice(0, 2).map((addition) => (
              <p key={addition.id} className="truncate">
                {addition.title}: {addition.type === 'quantity'
                  ? `${formatPrice(addition.price)}/${addition.unitLabel}`
                  : `+${formatPrice(addition.price)}`}
              </p>
            ))}
          </div>
        )}

        {shouldShowCategoryLink && categoryHref && (
          <span
            role="link"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              navigate(categoryHref);
            }}
            className="mt-0.5 block cursor-pointer text-xs text-muted-foreground/70 underline-offset-2 hover:text-foreground"
          >
            В категорию «{product.category.name}»
          </span>
        )}
      </div>
    </div>
  );
}
