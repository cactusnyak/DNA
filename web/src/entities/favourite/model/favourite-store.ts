import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { FavouriteItem } from '../types/favourite-item';

type FavouriteStore = {
  guestItems: FavouriteItem[];

  addGuestItem: (item: FavouriteItem) => void;
  removeGuestItem: (item: FavouriteItem) => void;
  clearGuestItems: () => void;
  isGuestFavourite: (item: FavouriteItem) => boolean;
};

export const useFavouriteStore = create<FavouriteStore>()(
  persist(
    (set, get) => ({
      guestItems: [],

      addGuestItem: (item) => {
        const already = get().isGuestFavourite(item);
        if (already) return;
        set((state) => ({ guestItems: [...state.guestItems, item] }));
      },

      removeGuestItem: (item) => {
        set((state) => ({
          guestItems: state.guestItems.filter((g) => {
            if (item.productId) return g.productId !== item.productId;
            if (item.adId) return g.adId !== item.adId;
            return true;
          }),
        }));
      },

      clearGuestItems: () => set({ guestItems: [] }),

      isGuestFavourite: (item) => {
        return get().guestItems.some((g) => {
          if (item.productId) return g.productId === item.productId;
          if (item.adId) return g.adId === item.adId;
          return false;
        });
      },
    }),
    {
      name: 'dna-favourites',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ guestItems: state.guestItems }),
    },
  ),
);
