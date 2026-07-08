import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/entities/auth';

import { addFavourite, getFavourites, removeFavourite } from '../api/favourites-api';
import { useFavouriteStore } from '../model/favourite-store';
import type { FavouriteItem } from '../types/favourite-item';

export function useFavourite(item: FavouriteItem) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  const { isGuestFavourite, addGuestItem, removeGuestItem } =
    useFavouriteStore();

  const { data: serverFavourites = [] } = useQuery({
    queryKey: ['favourites', accessToken],
    queryFn: () => getFavourites(accessToken!),
    enabled: Boolean(accessToken),
  });

  const isFavourite = accessToken
    ? serverFavourites.some((f) => {
        if (item.productId) return f.productId === item.productId;
        if (item.adId) return f.adId === item.adId;
        return false;
      })
    : isGuestFavourite(item);

  const addMutation = useMutation({
    mutationFn: () => addFavourite(item, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favourites'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => removeFavourite(item, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favourites'] });
    },
  });

  function toggle() {
    if (!accessToken) {
      if (isFavourite) {
        removeGuestItem(item);
      } else {
        addGuestItem(item);
      }
      return;
    }

    if (isFavourite) {
      removeMutation.mutate();
    } else {
      addMutation.mutate();
    }
  }

  return {
    isFavourite,
    toggle,
    isPending: addMutation.isPending || removeMutation.isPending,
  };
}
