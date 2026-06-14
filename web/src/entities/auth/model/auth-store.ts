import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AuthStore = {
  accessToken?: string;
  setAccessToken: (accessToken: string) => void;
  clearAccessToken: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: undefined,

      setAccessToken: (accessToken) => {
        set({
          accessToken,
        });
      },

      clearAccessToken: () => {
        set({
          accessToken: undefined,
        });
      },
    }),
    {
      name: 'dna-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
      }),
    },
  ),
);