import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/entities/auth';
import { getFavourites, useFavouriteStore } from '@/entities/favourite';

export function FavouritesBadge() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const guestItems = useFavouriteStore((state) => state.guestItems);

  const { data: serverFavourites } = useQuery({
    queryKey: ['favourites', accessToken],
    queryFn: () => getFavourites(accessToken!),
    enabled: Boolean(accessToken),
    staleTime: 1000 * 60,
  });

  const count = accessToken
    ? (serverFavourites?.length ?? 0)
    : guestItems.length;

  if (count <= 0) {
    return null;
  }

  const label = count > 99 ? '99+' : String(count);

  return (
    <span className="absolute -right-2 -top-2 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] leading-4 text-primary-foreground">
      {label}
    </span>
  );
}
