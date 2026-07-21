import type { CatalogCategory } from '@/shared/types/catalog-category';
import { getChildrenCategories } from './get-children-categories';

export function getSearchResults(
  categories: CatalogCategory[],
  searchValue: string,
) {
  const normalizedSearchValue = searchValue.trim().toLowerCase();

  // Rule 1: If search is empty, show all categories
  if (!normalizedSearchValue) {
    return {
      visibleCategories: categories,
      expandedCategories: new Set<string>(),
      hasAnyMatches: true,
    };
  }

  // Find directly matched categories
  const directlyMatchedCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(normalizedSearchValue),
  );

  // Rule 4: If no matches, hide everything
  if (directlyMatchedCategories.length === 0) {
    return {
      visibleCategories: [],
      expandedCategories: new Set<string>(),
      hasAnyMatches: false,
    };
  }

  const visibleCategoryIds = new Set<string>();
  const expandedCategoryIds = new Set<string>();

  // For each matched category, add it and all its parents to visible
  // Rule 3: Show only matching nodes, expand parents only to reach matches
  for (const matchedCategory of directlyMatchedCategories) {
    // Add the matched category itself
    visibleCategoryIds.add(matchedCategory.id);
    
    // Add all parents (to show the path) and mark them for expansion
    let currentCategory = matchedCategory;
    while (currentCategory.parentId) {
      const parent = categories.find(cat => cat.id === currentCategory!.parentId);
      if (parent) {
        visibleCategoryIds.add(parent.id);
        expandedCategoryIds.add(parent.id); // Expand parent to show child
        currentCategory = parent;
      } else {
        break;
      }
    }
  }

  // Rule 2: Don't display child nodes if their parent matches directly
  // (children of directly matched parents are hidden)
  const childIdsToHide = new Set<string>();
  for (const matchedCategory of directlyMatchedCategories) {
    const children = getChildrenCategories(categories, matchedCategory.id);
    children.forEach(child => childIdsToHide.add(child.id));
  }

  // Remove children of directly matched parents from visible
  childIdsToHide.forEach(id => visibleCategoryIds.delete(id));

  const visibleCategories = categories.filter(cat => visibleCategoryIds.has(cat.id));

  return {
    visibleCategories,
    expandedCategories: expandedCategoryIds,
    hasAnyMatches: true,
  };
}
