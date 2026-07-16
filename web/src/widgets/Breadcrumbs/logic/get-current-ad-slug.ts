import type { BreadcrumbMatch } from '../types/breadcrumbs';

export function getCurrentAdSlug(matches: BreadcrumbMatch[]) {
  return matches.find((match) => match.params.adSlug)?.params.adSlug;
}
