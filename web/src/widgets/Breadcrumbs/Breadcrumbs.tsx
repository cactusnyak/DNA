import { useQuery } from '@tanstack/react-query';
import { useMatches } from 'react-router-dom';

import { getAd } from '@/entities/ad';
import { getCatalogCategories } from '@/shared/catalog';
import { getProduct } from '@/entities/product/api/get-product';
import { getPlatformSectionIdFromPathname } from '@/shared/platform';

import { BreadcrumbsList } from './components/BreadcrumbsList';
import { buildBreadcrumbItems } from './logic/build-breadcrumb-items';
import { getCurrentAdSlug } from './logic/get-current-ad-slug';
import { getCurrentCategorySlug } from './logic/get-current-category-slug';
import { getCurrentProductSlug } from './logic/get-current-product-slug';
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
  const productSlug = getCurrentProductSlug(matches);
  const adSlug = getCurrentAdSlug(matches);

  const { data: categories } = useQuery({
    queryKey: ['categories', activeSection],
    queryFn: () => getCatalogCategories({ section: activeSection }),
    enabled: Boolean(activeSection && (categorySlug || productSlug || adSlug)),
  });

  const { data: product } = useQuery({
    queryKey: ['product', productSlug],
    queryFn: () => getProduct(productSlug ?? ''),
    enabled: Boolean(productSlug),
  });

  const { data: ad } = useQuery({
    queryKey: ['ad', adSlug],
    queryFn: () => getAd(adSlug ?? ''),
    enabled: Boolean(adSlug),
  });

  const breadcrumbItems = buildBreadcrumbItems({
    matches,
    root,
    activeSection,
    categories,
    categorySlug,
    product,
    productSlug,
    ad,
    adSlug,
  });

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return <BreadcrumbsList items={breadcrumbItems} />;
}

