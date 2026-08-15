import { create } from 'zustand';

const storageKey = 'dna-essential-storage-notice';
const acknowledgedValue = 'acknowledged';

function readIsAcknowledged() {
  try {
    return window.localStorage.getItem(storageKey) === acknowledgedValue;
  } catch {
    return false; // Storage may be unavailable.
  }
}

type CookieNoticeStore = {
  isVisible: boolean;
  acknowledge: () => void;
  reset: () => void;
};

export const useCookieNoticeStore = create<CookieNoticeStore>()((set) => ({
  isVisible: !readIsAcknowledged(),
  acknowledge: () => {
    try {
      window.localStorage.setItem(storageKey, acknowledgedValue);
    } catch {
      /* Storage may be unavailable. */
    }

    set({ isVisible: false });
  },
  reset: () => {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      /* Storage may be unavailable. */
    }

    set({ isVisible: true });
  },
}));

export function resetCookieNotice() {
  useCookieNoticeStore.getState().reset();
}
