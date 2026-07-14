import { create } from 'zustand';

type HeaderStore = {
  isHidden: boolean;
  setIsHidden: (isHidden: boolean) => void;
};

export const useHeaderStore = create<HeaderStore>()((set) => ({
  isHidden: false,
  setIsHidden: (isHidden) => set({ isHidden }),
}));
