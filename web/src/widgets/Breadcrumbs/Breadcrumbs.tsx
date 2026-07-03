import { useQuery } from '@tanstack/react-query';
import { useMatches } from 'react-router-dom';

import { getCategories } from '@/entities/category/api/get-categories';
import { getProduct } from '@/entities/product/api/get-product';
import { getPlatformSectionIdFromPathname } from '@/shared/platform';

import { BreadcrumbsList } from './components/BreadcrumbsList';
import { buildBreadcrumbItems } from './logic/build-breadcrumb-items';
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

  const { data: categories } = useQuery({
    queryKey: ['categories', activeSection],
    queryFn: () => getCategories({ section: activeSection }),
    enabled: Boolean(activeSection && (categorySlug || productId)),
  });

  const { data: product } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProduct(productId ?? ''),
    enabled: Boolean(productId),
  });

  const breadcrumbItems = buildBreadcrumbItems({
    matches,
    root,
    activeSection,
    categories,
    categorySlug,
    product,
    productId,
  });

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return <BreadcrumbsList items={breadcrumbItems} />;
}
