import type { BreadcrumbItem } from '../types/breadcrumbs';

export function removeDuplicateBreadcrumbs(items: BreadcrumbItem[]) {
  const usedHrefs = new Set<string>();

  return items.filter((item) => {
    if (usedHrefs.has(item.href)) {
      return false;
    }

    usedHrefs.add(item.href);
    return true;
  });
}