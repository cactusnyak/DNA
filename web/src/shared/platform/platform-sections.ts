export const PLATFORM_SECTION = {
  ADS: 'ads',
  MARKET: 'market',
} as const;

export type PlatformSectionId =
  (typeof PLATFORM_SECTION)[keyof typeof PLATFORM_SECTION];

export type CatalogScope = 'ADS' | 'MARKET';

export type PlatformSectionConfig = {
  id: PlatformSectionId;
  label: string;
  href: string;
  catalogHref: string;
  apiScope: CatalogScope;
  searchPlaceholder: string;
  catalogLabel: string;
  categoryPreviewTitle: string;
  catalogDescription: string;
};

export const platformSections: Record<
  PlatformSectionId,
  PlatformSectionConfig
> = {
  [PLATFORM_SECTION.ADS]: {
    id: PLATFORM_SECTION.ADS,
    label: 'Доска',
    href: '/ads',
    catalogHref: '/ads/catalog',
    apiScope: 'ADS',
    searchPlaceholder: 'Поиск по доске',
    catalogLabel: 'Каталог Доски',
    categoryPreviewTitle: 'Категории Доски',
    catalogDescription: 'Категории объявлений пользователей.',
  },
  [PLATFORM_SECTION.MARKET]: {
    id: PLATFORM_SECTION.MARKET,
    label: 'Маркет',
    href: '/market',
    catalogHref: '/market/catalog',
    apiScope: 'MARKET',
    searchPlaceholder: 'Поиск по маркету',
    catalogLabel: 'Каталог Маркета',
    categoryPreviewTitle: 'Категории Маркета',
    catalogDescription: 'Полное дерево категорий маркета с товарами DNA.',
  },
};

export const platformSectionList = [
  platformSections[PLATFORM_SECTION.ADS],
  platformSections[PLATFORM_SECTION.MARKET],
] as const;

export function isPlatformSectionId(
  value: string | undefined,
): value is PlatformSectionId {
  return value === PLATFORM_SECTION.ADS || value === PLATFORM_SECTION.MARKET;
}

export function getPlatformSection(
  sectionId: PlatformSectionId,
): PlatformSectionConfig;
export function getPlatformSection(sectionId: null): null;
export function getPlatformSection(
  sectionId: PlatformSectionId | null,
): PlatformSectionConfig | null;
export function getPlatformSection(
  sectionId: PlatformSectionId | null,
): PlatformSectionConfig | null {
  if (!sectionId) {
    return null;
  }

  return platformSections[sectionId];
}

export function getPlatformSectionIdFromPathname(
  pathname: string,
): PlatformSectionId | null {
  const firstPathPart = pathname.split('/').filter(Boolean)[0];

  return isPlatformSectionId(firstPathPart) ? firstPathPart : null;
}

export function getPlatformCatalogHref(sectionId: PlatformSectionId): string;
export function getPlatformCatalogHref(sectionId: null): null;
export function getPlatformCatalogHref(
  sectionId: PlatformSectionId | null,
): string | null;
export function getPlatformCatalogHref(
  sectionId: PlatformSectionId | null,
): string | null {
  return getPlatformSection(sectionId)?.catalogHref ?? null;
}

export function getPlatformCategoryHref(
  sectionId: PlatformSectionId,
  categoryPath: string | null | undefined,
): string;
export function getPlatformCategoryHref(
  sectionId: null,
  categoryPath: string | null | undefined,
): null;
export function getPlatformCategoryHref(
  sectionId: PlatformSectionId | null,
  categoryPath: string | null | undefined,
): string | null;
export function getPlatformCategoryHref(
  sectionId: PlatformSectionId | null,
  categoryPath: string | null | undefined,
): string | null {
  const catalogHref = getPlatformCatalogHref(sectionId);

  if (!catalogHref) {
    return null;
  }

  if (!categoryPath) {
    return catalogHref;
  }

  const normalizedCategoryPath = categoryPath
    .split('/')
    .filter(Boolean)
    .join('/');

  if (!normalizedCategoryPath) {
    return catalogHref;
  }

  return `${catalogHref}/${normalizedCategoryPath}`;
}

export function getPlatformProductHref(productSlugOrId: string) {
  return `/market/product/${productSlugOrId}`;
}

export function getPlatformAdHref(adSlugOrId: string) {
  return `/ads/ad/${adSlugOrId}`;
}
