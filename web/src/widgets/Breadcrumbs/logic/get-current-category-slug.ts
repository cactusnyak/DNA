import type { BreadcrumbMatch } from '../types/breadcrumbs';

export function getCurrentCategorySlug(matches: BreadcrumbMatch[]) {
  const categoryPath = matches.find((match) => match.params['*'])?.params['*'];

  return categoryPath?.split('/').filter(Boolean).at(-1);
}