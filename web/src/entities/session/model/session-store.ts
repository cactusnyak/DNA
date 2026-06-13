import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

function createGuestSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `guest-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

type SessionStore = {
  guestSessionId: string;
  resetGuestSession: () => void;
};

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      guestSessionId: createGuestSessionId(),

      resetGuestSession: () => {
        set({
          guestSessionId: createGuestSessionId(),
        });
      },
    }),
    {
      name: 'dna-session',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);