import type { Category } from '@/entities/category';
import {
  PLATFORM_SECTION,
  type PlatformSectionId,
} from '@/shared/platform';
import { httpClient } from '@/shared/api/http-client';

type GetCategoriesParams = {
  section?: PlatformSectionId | null;
};

function getCategoriesPath(section: PlatformSectionId) {
  return section === PLATFORM_SECTION.ADS
    ? '/ads/categories'
    : '/market/categories';
}

export function getCategories(params: GetCategoriesParams = {}) {
  if (!params.section) {
    return Promise.resolve([] as Category[]);
  }

  return httpClient<Category[]>(getCategoriesPath(params.section));
}
