import { globalSearchSections } from '../data/global-search-sections';
import { getSearchTokens, normalizeSearchValue } from './normalize-search-value';

export function filterGlobalSearchSections(searchValue: string) {
  const tokens = getSearchTokens(searchValue);

  if (!tokens.length) {
    return [];
  }

  return globalSearchSections.filter((section) => {
    const searchableValue = normalizeSearchValue(
      [
        section.title,
        section.description,
        section.href,
        ...section.keywords,
      ].join(' '),
    );

    return tokens.every((token) => searchableValue.includes(token));
  });
}