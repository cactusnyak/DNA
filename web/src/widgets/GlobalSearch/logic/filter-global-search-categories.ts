import type { Category } from '@/entities/category';
import { getCategoryPath } from '@/entities/category/utils/category-path';

import { getSearchTokens, normalizeSearchValue } from './normalize-search-value';

function getCategorySearchableValue(category: Category, categories: Category[]) {
  const categoryPath = getCategoryPath(categories, category.id)
    .map((pathCategory) => pathCategory.name)
    .join(' ');

  return normalizeSearchValue(
    [
      category.name,
      category.description,
      category.slug,
      category.path,
      categoryPath,
    ].join(' '),
  );
}

function getCategorySearchScore(
  category: Category,
  categories: Category[],
  searchValue: string,
  tokens: string[],
) {
  const normalizedSearchValue = normalizeSearchValue(searchValue);
  const normalizedName = normalizeSearchValue(category.name);
  const normalizedDescription = normalizeSearchValue(category.description ?? '');
  const normalizedPath = normalizeSearchValue(
    getCategoryPath(categories, category.id)
      .map((pathCategory) => pathCategory.name)
      .join(' '),
  );

  let score = 0;

  if (normalizedName === normalizedSearchValue) {
    score += 100;
  }

  if (normalizedName.includes(normalizedSearchValue)) {
    score += 70;
  }

  if (tokens.every((token) => normalizedName.includes(token))) {
    score += 40;
  }

  if (tokens.some((token) => normalizedPath.includes(token))) {
    score += 25;
  }

  if (tokens.some((token) => normalizedDescription.includes(token))) {
    score += 15;
  }

  return score;
}

export function filterGlobalSearchCategories(
  categories: Category[],
  searchValue: string,
) {
  const tokens = getSearchTokens(searchValue);

  if (!tokens.length) {
    return [];
  }

  return categories
    .map((category) => {
      const searchableValue = getCategorySearchableValue(category, categories);
      const hasMatch = tokens.every((token) => searchableValue.includes(token));

      return {
        category,
        score: hasMatch
          ? getCategorySearchScore(category, categories, searchValue, tokens)
          : 0,
      };
    })
    .filter((item) => item.score > 0)
    .sort((first, second) => second.score - first.score)
    .map((item) => item.category);
}