import type { Category } from '@/entities/category';
import type { Product } from '@/entities/product';

import {
  BREADCRUMB_TYPE,
  type BreadcrumbItem,
  type BreadcrumbMatch,
} from '../types/breadcrumbs';

import { getCategoryBreadcrumbItems } from './get-category-breadcrumb-items';
import { removeDuplicateBreadcrumbs } from './remove-duplicate-breadcrumbs';

type BuildBreadcrumbItemsParams = {
  matches: BreadcrumbMatch[];
  root: BreadcrumbItem;
  categories?: Category[];
  categorySlug?: string;
  product?: Product;
  productId?: string;
};

const catalogBreadcrumbItem: BreadcrumbItem = {
  id: 'catalog',
  href: '/catalog',
  label: 'Каталог',
};

function getLastCategorySlugFromProduct(product: Product) {
  const categoryPathParts = product.category.path.split('/').filter(Boolean);

  return categoryPathParts.at(-1) ?? product.category.slug;
}

function getProductBreadcrumbItems({
  categories,
  product,
  productId,
}: Pick<
  BuildBreadcrumbItemsParams,
  'categories' | 'product' | 'productId'
>): BreadcrumbItem[] {
  if (!product) {
    return [
      catalogBreadcrumbItem,
      {
        id: `product-${productId ?? 'unknown'}`,
        href: productId ? `/product/${productId}` : '/catalog',
        label: 'Товар',
      },
    ];
  }

  const productCategorySlug = getLastCategorySlugFromProduct(product);

  return [
    catalogBreadcrumbItem,
    ...getCategoryBreadcrumbItems(categories ?? [], productCategorySlug),
    {
      id: `product-${product.id}`,
      href: `/product/${product.id}`,
      label: product.title,
    },
  ];
}

export function buildBreadcrumbItems({
  matches,
  root,
  categories = [],
  categorySlug,
  product,
  productId,
}: BuildBreadcrumbItemsParams) {
  const isHomePage = matches.some(
    (match) =>
      match.pathname === root.href &&
      match.handle?.breadcrumb?.type === BREADCRUMB_TYPE.HOME,
  );

  if (isHomePage) {
    return [];
  }

  const routeBreadcrumbItems = matches.flatMap<BreadcrumbItem>((match) => {
    const breadcrumb = match.handle?.breadcrumb;

    if (!breadcrumb) {
      return [];
    }

    switch (breadcrumb.type) {
      case BREADCRUMB_TYPE.HOME:
        return [];

      case BREADCRUMB_TYPE.CATALOG:
        return [
          {
            id: 'catalog',
            href: breadcrumb.href ?? '/catalog',
            label: breadcrumb.label,
          },
        ];

      case BREADCRUMB_TYPE.CATEGORY:
        if (!categorySlug) {
          return [];
        }

        return getCategoryBreadcrumbItems(categories, categorySlug);

      case BREADCRUMB_TYPE.PRODUCT:
        return getProductBreadcrumbItems({
          categories,
          product,
          productId,
        });

      case BREADCRUMB_TYPE.STATIC:
        return [
          {
            id: match.id,
            href: breadcrumb.href ?? match.pathname,
            label: breadcrumb.label,
          },
        ];

      default:
        return [];
    }
  });

  return removeDuplicateBreadcrumbs([root, ...routeBreadcrumbItems]);
}