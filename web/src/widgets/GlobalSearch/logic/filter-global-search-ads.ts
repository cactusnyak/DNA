import type { Ad } from '@/entities/ad';
import { formatPrice } from '@/shared/utils/format-price';

import { getSearchTokens, normalizeSearchValue } from './normalize-search-value';

function getNumericSearchValue(searchValue: string) {
  const numericValue = searchValue.replace(/\D/g, '');
  return numericValue.length >= 2 ? numericValue : undefined;
}

function getAdSearchScore(
  ad: Ad,
  searchValue: string,
  tokens: string[],
  numericSearchValue?: string,
) {
  const normalizedSearch = normalizeSearchValue(searchValue);
  const normalizedTitle = normalizeSearchValue(ad.title);
  const normalizedDescription = normalizeSearchValue(ad.description ?? '');
  const normalizedCategory = normalizeSearchValue(ad.category?.name ?? '');
  const adPrice = String(Math.round(ad.price));

  let score = 0;

  if (normalizedTitle.includes(normalizedSearch)) score += 80;
  if (tokens.every((t) => normalizedTitle.includes(t))) score += 50;
  if (tokens.some((t) => normalizedCategory.includes(t))) score += 25;
  if (tokens.some((t) => normalizedDescription.includes(t))) score += 15;
  if (numericSearchValue && adPrice.includes(numericSearchValue)) score += 35;

  return score;
}

export function filterGlobalSearchAds(ads: Ad[], searchValue: string) {
  const tokens = getSearchTokens(searchValue);
  const numericSearchValue = getNumericSearchValue(searchValue);

  if (!tokens.length && !numericSearchValue) return [];

  const searchable = (ad: Ad) =>
    normalizeSearchValue(
      [
        ad.title,
        ad.description ?? '',
        ad.category?.name ?? '',
        String(ad.price),
        formatPrice(ad.price),
      ].join(' '),
    );

  return ads
    .map((ad) => {
      const searchableValue = searchable(ad);
      const hasTextMatch = tokens.every((t) => searchableValue.includes(t));
      const hasPriceMatch = numericSearchValue
        ? String(Math.round(ad.price)).includes(numericSearchValue)
        : false;

      return {
        ad,
        score:
          hasTextMatch || hasPriceMatch
            ? getAdSearchScore(ad, searchValue, tokens, numericSearchValue)
            : 0,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.ad);
}
