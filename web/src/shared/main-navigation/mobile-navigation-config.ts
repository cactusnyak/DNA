export const MOBILE_NAVIGATION_CSS_VAR = '--mobile-navigation-height';

const MOBILE_NAVIGATION_DEFAULT_HEIGHT = 60;

export function setMobileNavigationHeight(px: number): void {
  document.documentElement.style.setProperty(
    MOBILE_NAVIGATION_CSS_VAR,
    `${px}px`,
  );
}

export function mobileNavigationHeightVar(
  fallback = `${MOBILE_NAVIGATION_DEFAULT_HEIGHT}px`,
): string {
  return `var(${MOBILE_NAVIGATION_CSS_VAR}, ${fallback})`;
}
