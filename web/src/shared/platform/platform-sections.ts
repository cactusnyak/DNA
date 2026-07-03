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
    catalogLabel: 'Каталог доски',
    categoryPreviewTitle: 'Категории доски',
    catalogDescription: 'Категории для будущих объявлений пользователей.',
  },
  [PLATFORM_SECTION.MARKET]: {
    id: PLATFORM_SECTION.MARKET,
    label: 'Маркет',
    href: '/market',
    catalogHref: '/market/catalog',
    apiScope: 'MARKET',
    searchPlaceholder: 'Поиск по маркету',
    catalogLabel: 'Каталог маркета',
    categoryPreviewTitle: 'Категории маркета',
    catalogDescription: 'Полное дерево категорий маркета с товарами DNA.',
  },
};

export const platformSectionList = [
  platformSections[PLATFORM_SECTION.ADS],
  platformSections[PLATFORM_SECTION.MARKET],
] as const;

export const DEFAULT_PLATFORM_SECTION_ID = PLATFORM_SECTION.MARKET;

export function isPlatformSectionId(
  value: string | undefined,
): value is PlatformSectionId {
  return value === PLATFORM_SECTION.ADS || value === PLATFORM_SECTION.MARKET;
}

export function getPlatformSection(
  sectionId: PlatformSectionId = DEFAULT_PLATFORM_SECTION_ID,
) {
  return platformSections[sectionId];
}

export function getPlatformSectionIdFromPathname(pathname: string) {
  const firstPathPart = pathname.split('/').filter(Boolean)[0];

  return isPlatformSectionId(firstPathPart)
    ? firstPathPart
    : DEFAULT_PLATFORM_SECTION_ID;
}

export function getPlatformCatalogHref(
  sectionId: PlatformSectionId = DEFAULT_PLATFORM_SECTION_ID,
) {
  return getPlatformSection(sectionId).catalogHref;
}

export function getPlatformCategoryHref(
  sectionId: PlatformSectionId,
  categoryPath: string,
) {
  const normalizedCategoryPath = categoryPath
    .split('/')
    .filter(Boolean)
    .join('/');

  if (!normalizedCategoryPath) {
    return getPlatformCatalogHref(sectionId);
  }

  return `${getPlatformCatalogHref(sectionId)}/${normalizedCategoryPath}`;
}

export function getPlatformProductHref(productId: string) {
  return `/market/product/${productId}`;
}
