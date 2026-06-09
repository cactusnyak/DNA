import { useMatches } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { getCategories } from '@/entities/category/api/get-categories';

import { BreadcrumbsList } from './components/BreadcrumbsList';
import { buildBreadcrumbItems } from './logic/build-breadcrumb-items';
import { getCurrentCategorySlug } from './logic/get-current-category-slug';
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

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    enabled: Boolean(categorySlug),
  });

  const breadcrumbItems = buildBreadcrumbItems({
    matches,
    root,
    categories,
    categorySlug,
  });

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return <BreadcrumbsList items={breadcrumbItems} />;
}