import { httpClient } from '@/shared/api/http-client';

import type { FeedItem } from '../types/feed-item';

export function getFeed() {
  return httpClient<FeedItem[]>('/feed');
}
