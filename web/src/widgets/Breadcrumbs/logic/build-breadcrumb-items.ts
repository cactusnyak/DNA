import type { Category } from '@/entities/category';
import type { Product } from '@/entities/product';
import {
  getPlatformCatalogHref,
  getPlatformProductHref,
  type PlatformSectionId,
} from '@/shared/platform';

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
  activeSection: PlatformSectionId | null;
  categories?: Category[];
  categorySlug?: string;
  product?: Product;
  productId?: string;
};

function getCatalogBreadcrumbItem(
  section: PlatformSectionId | null,
): BreadcrumbItem | null {
  if (!section) {
    return null;
  }

  return {
    id: `${section}-catalog`,
    href: getPlatformCatalogHref(section),
    label: 'Каталог',
  };
}

function getLastCategorySlugFromProduct(product: Product) {
  const categoryPathParts = product.category.path.split('/').filter(Boolean);

  return categoryPathParts.at(-1) ?? product.category.slug;
}

function getProductBreadcrumbItems({
  activeSection,
  categories,
  product,
  productId,
}: Pick<
  BuildBreadcrumbItemsParams,
  'activeSection' | 'categories' | 'product' | 'productId'
>): BreadcrumbItem[] {
  const catalogBreadcrumbItem = getCatalogBreadcrumbItem(activeSection);

  if (!activeSection || !catalogBreadcrumbItem) {
    return [
      {
        id: `product-${product?.id ?? productId ?? 'unknown'}`,
        href: productId ? getPlatformProductHref(productId) : '/market/catalog',
        label: product?.title ?? 'Товар',
      },
    ];
  }

  if (!product) {
    return [
      catalogBreadcrumbItem,
      {
        id: `product-${productId ?? 'unknown'}`,
        href: productId
          ? getPlatformProductHref(productId)
          : getPlatformCatalogHref(activeSection),
        label: 'Товар',
      },
    ];
  }

  const productCategorySlug = getLastCategorySlugFromProduct(product);

  return [
    catalogBreadcrumbItem,
    ...getCategoryBreadcrumbItems(
      categories ?? [],
      productCategorySlug,
      activeSection,
    ),
    {
      id: `product-${product.id}`,
      href: getPlatformProductHref(product.id),
      label: product.title,
    },
  ];
}

export function buildBreadcrumbItems({
  matches,
  root,
  activeSection,
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

      case BREADCRUMB_TYPE.CATALOG: {
        const catalogHref = activeSection
          ? getPlatformCatalogHref(activeSection)
          : breadcrumb.href;

        if (!catalogHref) {
          return [];
        }

        return [
          {
            id: `${activeSection ?? 'unknown'}-catalog`,
            href: breadcrumb.href ?? catalogHref,
            label: breadcrumb.label,
          },
        ];
      }

      case BREADCRUMB_TYPE.CATEGORY:
        if (!categorySlug || !activeSection) {
          return [];
        }

        return getCategoryBreadcrumbItems(
          categories,
          categorySlug,
          activeSection,
        );

      case BREADCRUMB_TYPE.PRODUCT:
        return getProductBreadcrumbItems({
          activeSection,
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
