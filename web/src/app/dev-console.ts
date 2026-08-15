import { resetCookieNotice } from '@/widgets/CookieNotice';

const devConsoleApi = {
  resetCookieNotice,
} as const;

declare global {
  interface Window {
    dna?: typeof devConsoleApi;
  }
}

export function registerDevConsoleApi() {
  window.dna = devConsoleApi;
}
