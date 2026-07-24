import { create } from 'zustand';

type HeaderStore = {
  isHidden: boolean;
  isSearchActive: boolean;
  setIsHidden: (isHidden: boolean) => void;
  setIsSearchActive: (isSearchActive: boolean) => void;
};

export const useHeaderStore = create<HeaderStore>()((set) => ({
  isHidden: false,
  isSearchActive: false,
  setIsHidden: (isHidden) => set({ isHidden }),
  setIsSearchActive: (isSearchActive) =>
    set({
      isSearchActive,
      ...(isSearchActive ? { isHidden: false } : {}),
    }),
}));
