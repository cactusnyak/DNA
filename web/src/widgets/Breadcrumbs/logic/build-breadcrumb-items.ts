import type {
  BreadcrumbItem,
  BreadcrumbMatch,
} from '../types/breadcrumbs';
import { getCategoryBreadcrumbItems } from './get-category-breadcrumb-items';
import { removeDuplicateBreadcrumbs } from './remove-duplicate-breadcrumbs';

type BuildBreadcrumbItemsParams = {
  matches: BreadcrumbMatch[];
  root: BreadcrumbItem;
  categories?: import('@/entities/category').Category[];
  categorySlug?: string;
};

export function buildBreadcrumbItems({
  matches,
  root,
  categories = [],
  categorySlug,
}: BuildBreadcrumbItemsParams) {
  const isHomePage = matches.some(
    (match) => match.pathname === root.href && match.handle?.breadcrumb,
  );

  if (isHomePage) {
    return [];
  }

  const routeBreadcrumbItems = matches
    .filter((match) => match.handle?.breadcrumb)
    .flatMap<BreadcrumbItem>((match) => {
      const breadcrumb = match.handle?.breadcrumb;

      if (breadcrumb === root.label && match.pathname === root.href) {
        return [];
      }

      if (breadcrumb === 'Каталог') {
        return [
          {
            id: 'catalog',
            href: '/catalog',
            label: 'Каталог',
          },
        ];
      }

      if (breadcrumb === 'Категория' && categorySlug) {
        return getCategoryBreadcrumbItems(categories, categorySlug);
      }

      return [
        {
          id: match.id,
          href: match.pathname,
          label: breadcrumb ?? '',
        },
      ];
    });

  return removeDuplicateBreadcrumbs([root, ...routeBreadcrumbItems]);
}