import { useQuery } from '@tanstack/react-query';
import { useMatches } from 'react-router-dom';

import { getCategories } from '@/entities/category/api/get-categories';
import { getProduct } from '@/entities/product/api/get-product';

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

export function Breadcrumbs({ root = defaultRoot }: BreadcrumbsProps) {
  const matches = useMatches() as BreadcrumbMatch[];

  const categorySlug = getCurrentCategorySlug(matches);
  const productId = getCurrentProductId(matches);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    enabled: Boolean(categorySlug || productId),
  });

  const { data: product } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProduct(productId ?? ''),
    enabled: Boolean(productId),
  });

  const breadcrumbItems = buildBreadcrumbItems({
    matches,
    root,
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