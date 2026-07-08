import { httpClient } from '@/shared/api/http-client';

import type { Favourite } from '../types/favourite';
import type { FavouriteItem } from '../types/favourite-item';

function authHeader(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

export function getFavourites(accessToken: string): Promise<Favourite[]> {
  return httpClient<Favourite[]>('/favourites', {
    headers: authHeader(accessToken),
  });
}

export function addFavourite(
  item: FavouriteItem,
  accessToken: string,
): Promise<Favourite> {
  return httpClient<Favourite, FavouriteItem>('/favourites', {
    method: 'POST',
    body: item,
    headers: authHeader(accessToken),
  });
}

export function removeFavourite(
  item: FavouriteItem,
  accessToken: string,
): Promise<{ success: boolean }> {
  return httpClient<{ success: boolean }, FavouriteItem>('/favourites', {
    method: 'DELETE',
    body: item,
    headers: authHeader(accessToken),
  });
}

export function syncFavourites(
  items: FavouriteItem[],
  accessToken: string,
): Promise<{ synced: number }> {
  return httpClient<{ synced: number }, { items: FavouriteItem[] }>(
    '/favourites/sync',
    {
      method: 'POST',
      body: { items },
      headers: authHeader(accessToken),
    },
  );
}
