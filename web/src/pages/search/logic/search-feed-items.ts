import type { FeedItem } from '@/entities/feed';
import { getSearchTokens, normalizeSearchValue } from '@/widgets/GlobalSearch/logic/normalize-search-value';

export function getFeedItemEntity(item: FeedItem) {
  return item.type === 'PRODUCT' ? item.product : item.ad;
}

export function getFeedItemCategory(item: FeedItem) {
  return getFeedItemEntity(item).category;
}

export function feedItemMatchesQuery(item: FeedItem, query: string) {
  const tokens = getSearchTokens(query);

  if (!tokens.length) {
    return false;
  }

  const entity = getFeedItemEntity(item);
  const searchableValue = normalizeSearchValue(
    `${entity.title} ${entity.description ?? ''}`,
  );

  return tokens.every((token) => searchableValue.includes(token));
}
