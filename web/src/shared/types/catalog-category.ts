import type { Image } from '@/shared/types/image';

/**
 * Generic, scope-agnostic category shape used by shared catalog navigation
 * widgets (catalog, breadcrumbs, dropdown, search, previews).
 *
 * The scope-specific domain aliases `MarketCategory` (entities/market-category)
 * and `AdCategory` (entities/ad-category) are both structurally this type.
 */
export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  path: string;
  sortOrder: number;
  description?: string;
  parentId?: string;
  image?: Image;
};
