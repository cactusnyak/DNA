export function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase().replaceAll('ё', 'е');
}

export function getSearchTokens(value: string) {
  return normalizeSearchValue(value).split(/\s+/).filter(Boolean);
}