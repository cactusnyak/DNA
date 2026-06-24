import type { Product } from '@/entities/product';
import { formatPrice } from '@/shared/utils/format-price';

import { getSearchTokens, normalizeSearchValue } from './normalize-search-value';

function getNumericSearchValue(searchValue: string) {
  const numericValue = searchValue.replace(/\D/g, '');

  return numericValue.length >= 2 ? numericValue : undefined;
}

function getProductSearchableValue(product: Product) {
  return normalizeSearchValue(
    [
      product.title,
      product.description,
      product.category.name,
      product.category.slug,
      product.category.path,
      String(product.price),
      formatPrice(product.price),
    ].join(' '),
  );
}

function getProductSearchScore(
  product: Product,
  searchValue: string,
  tokens: string[],
  numericSearchValue?: string,
) {
  const normalizedSearchValue = normalizeSearchValue(searchValue);
  const normalizedTitle = normalizeSearchValue(product.title);
  const normalizedDescription = normalizeSearchValue(product.description);
  const normalizedCategory = normalizeSearchValue(product.category.name);
  const productPrice = String(Math.round(product.price));

  let score = 0;

  if (normalizedTitle.includes(normalizedSearchValue)) {
    score += 80;
  }

  if (tokens.every((token) => normalizedTitle.includes(token))) {
    score += 50;
  }

  if (tokens.some((token) => normalizedCategory.includes(token))) {
    score += 25;
  }

  if (tokens.some((token) => normalizedDescription.includes(token))) {
    score += 15;
  }

  if (numericSearchValue && productPrice.includes(numericSearchValue)) {
    score += 35;
  }

  return score;
}

export function filterGlobalSearchProducts(
  products: Product[],
  searchValue: string,
) {
  const tokens = getSearchTokens(searchValue);
  const numericSearchValue = getNumericSearchValue(searchValue);

  if (!tokens.length && !numericSearchValue) {
    return [];
  }

  return products
    .map((product) => {
      const searchableValue = getProductSearchableValue(product);
      const hasTextMatch = tokens.every((token) =>
        searchableValue.includes(token),
      );
      const hasPriceMatch = numericSearchValue
        ? String(Math.round(product.price)).includes(numericSearchValue)
        : false;

      return {
        product,
        score:
          hasTextMatch || hasPriceMatch
            ? getProductSearchScore(
                product,
                searchValue,
                tokens,
                numericSearchValue,
              )
            : 0,
      };
    })
    .filter((item) => item.score > 0)
    .sort((first, second) => second.score - first.score)
    .map((item) => item.product);
}