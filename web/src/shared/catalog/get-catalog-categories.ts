import { httpClient } from '@/shared/api/http-client';
import {
  PLATFORM_SECTION,
  type PlatformSectionId,
} from '@/shared/platform';
import type { CatalogCategory } from '@/shared/types/catalog-category';

type GetCatalogCategoriesParams = {
  section?: PlatformSectionId | null;
};

function getCatalogCategoriesPath(section: PlatformSectionId) {
  return section === PLATFORM_SECTION.ADS
    ? '/ads/categories'
    : '/market/categories';
}

export function getCatalogCategories(
  params: GetCatalogCategoriesParams = {},
) {
  if (!params.section) {
    return Promise.resolve([] as CatalogCategory[]);
  }

  return httpClient<CatalogCategory[]>(
    getCatalogCategoriesPath(params.section),
  );
}
