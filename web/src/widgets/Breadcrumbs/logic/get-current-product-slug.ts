import type { BreadcrumbMatch } from '../types/breadcrumbs';

export function getCurrentProductSlug(matches: BreadcrumbMatch[]) {
  return matches.find((match) => match.params.productSlug)?.params.productSlug;
}