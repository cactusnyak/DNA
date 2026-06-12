import type { BreadcrumbMatch } from '../types/breadcrumbs';

export function getCurrentProductId(matches: BreadcrumbMatch[]) {
  return matches.find((match) => match.params.productId)?.params.productId;
}