import type { CatalogCategory } from '@/shared/types/catalog-category';
import type { Ad } from '@/entities/ad';
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
  categories?: CatalogCategory[];
  categorySlug?: string;
  product?: Product;
  productSlug?: string;
  ad?: Ad;
  adSlug?: string;
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
  const categoryPathParts = (product.category.path ?? product.category.slug)
    .split('/')
    .filter(Boolean);

  return categoryPathParts.at(-1) ?? product.category.slug;
}

function getAdBreadcrumbItems({
  activeSection,
  categories,
  ad,
  adSlug,
}: Pick<
  BuildBreadcrumbItemsParams,
  'activeSection' | 'categories' | 'ad' | 'adSlug'
>): BreadcrumbItem[] {
  const catalogBreadcrumbItem = getCatalogBreadcrumbItem(activeSection);

  if (!activeSection || !catalogBreadcrumbItem) {
    return [
      {
        id: `ad-${ad?.id ?? adSlug ?? 'unknown'}`,
        href: adSlug ? `/ads/ad/${adSlug}` : '/ads/catalog',
        label: ad?.title ?? 'Объявление',
      },
    ];
  }

  if (!ad) {
    return [
      catalogBreadcrumbItem,
      {
        id: `ad-${adSlug ?? 'unknown'}`,
        href: adSlug ? `/ads/ad/${adSlug}` : catalogBreadcrumbItem.href,
        label: 'Объявление',
      },
    ];
  }

  const adCategorySlug = ad.category
    ? (ad.category.path ?? ad.category.slug).split('/').filter(Boolean).at(-1) ??
      ad.category.slug
    : null;

  const categoryItems = adCategorySlug
    ? getCategoryBreadcrumbItems(categories ?? [], adCategorySlug, activeSection)
    : [];

  return [
    catalogBreadcrumbItem,
    ...categoryItems,
    {
      id: `ad-${ad.id}`,
      href: `/ads/ad/${ad.slug}`,
      label: ad.title,
    },
  ];
}

function getProductBreadcrumbItems({
  activeSection,
  categories,
  product,
  productSlug,
}: Pick<
  BuildBreadcrumbItemsParams,
  'activeSection' | 'categories' | 'product' | 'productSlug'
>): BreadcrumbItem[] {
  const catalogBreadcrumbItem = getCatalogBreadcrumbItem(activeSection);

  if (!activeSection || !catalogBreadcrumbItem) {
    return [
      {
        id: `product-${product?.id ?? productSlug ?? 'unknown'}`,
        href: productSlug
          ? getPlatformProductHref(productSlug)
          : '/market/catalog',
        label: product?.title ?? 'Товар',
      },
    ];
  }

  if (!product) {
    return [
      catalogBreadcrumbItem,
      {
        id: `product-${productSlug ?? 'unknown'}`,
        href: productSlug
          ? getPlatformProductHref(productSlug)
          : catalogBreadcrumbItem.href,
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
      href: getPlatformProductHref(product.slug),
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
  productSlug,
  ad,
  adSlug,
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
          productSlug,
        });

      case BREADCRUMB_TYPE.AD:
        return getAdBreadcrumbItems({
          activeSection,
          categories,
          ad,
          adSlug,
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

