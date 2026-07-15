import type { BreadcrumbMatch } from '../types/breadcrumbs';

export function getCurrentAdId(matches: BreadcrumbMatch[]) {
  return matches.find((match) => match.params.adId)?.params.adId;
}
