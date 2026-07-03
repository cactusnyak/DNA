import type { Category } from '@/entities/category';
import {
  DEFAULT_PLATFORM_SECTION_ID,
  PLATFORM_SECTION,
  type PlatformSectionId,
} from '@/shared/platform';
import { httpClient } from '@/shared/api/http-client';

type GetCategoriesParams = {
  section?: PlatformSectionId;
};

function getCategoriesPath(section: PlatformSectionId) {
  return section === PLATFORM_SECTION.ADS
    ? '/ads/categories'
    : '/market/categories';
}

export function getCategories(params: GetCategoriesParams = {}) {
  const section = params.section ?? DEFAULT_PLATFORM_SECTION_ID;

  return httpClient<Category[]>(getCategoriesPath(section));
}
