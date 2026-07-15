import { useQuery } from '@tanstack/react-query';
import { useMatches } from 'react-router-dom';

import { getAd } from '@/entities/ad';
import { getCatalogCategories } from '@/shared/catalog';
import { getProduct } from '@/entities/product/api/get-product';
import { getPlatformSectionIdFromPathname } from '@/shared/platform';

import { BreadcrumbsList } from './components/BreadcrumbsList';
import { buildBreadcrumbItems } from './logic/build-breadcrumb-items';
import { getCurrentAdId } from './logic/get-current-ad-id';
import { getCurrentCategorySlug } from './logic/get-current-category-slug';
import { getCurrentProductId } from './logic/get-current-product-id';
import type {
  BreadcrumbItem,
  BreadcrumbMatch,
} from './types/breadcrumbs';

type BreadcrumbsProps = {
  root?: BreadcrumbItem;
};

const defaultRoot: BreadcrumbItem = {
  id: 'home',
  href: '/',
  label: 'Главная',
};

function getActiveBreadcrumbSection(matches: BreadcrumbMatch[]) {
  const lastMatch = matches.at(-1);

  return getPlatformSectionIdFromPathname(lastMatch?.pathname ?? '/');
}

export function Breadcrumbs({ root = defaultRoot }: BreadcrumbsProps) {
  const matches = useMatches() as BreadcrumbMatch[];

  const activeSection = getActiveBreadcrumbSection(matches);
  const categorySlug = getCurrentCategorySlug(matches);
  const productId = getCurrentProductId(matches);
  const adId = getCurrentAdId(matches);

  const { data: categories } = useQuery({
    queryKey: ['categories', activeSection],
    queryFn: () => getCatalogCategories({ section: activeSection }),
    enabled: Boolean(activeSection && (categorySlug || productId || adId)),
  });

  const { data: product } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProduct(productId ?? ''),
    enabled: Boolean(productId),
  });

  const { data: ad } = useQuery({
    queryKey: ['ad', adId],
    queryFn: () => getAd(adId ?? ''),
    enabled: Boolean(adId),
  });

  const breadcrumbItems = buildBreadcrumbItems({
    matches,
    root,
    activeSection,
    categories,
    categorySlug,
    product,
    productId,
    ad,
    adId,
  });

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return <BreadcrumbsList items={breadcrumbItems} />;
}

