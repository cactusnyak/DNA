export const HEADER_CSS_VAR = '--header-height';
export const HEADER_ANIMATION_DURATION_MS = 300;
export const HEADER_ANIMATION_EASING = 'ease-in-out';

const HEADER_DEFAULT_HEIGHT = 64;

export function getHeaderHeight(): number {
  return parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue(HEADER_CSS_VAR),
  ) || HEADER_DEFAULT_HEIGHT;
}

export function setHeaderHeight(px: number): void {
  document.documentElement.style.setProperty(HEADER_CSS_VAR, `${px}px`);
}

export function headerHeightVar(fallback = '64px'): string {
  return `var(${HEADER_CSS_VAR}, ${fallback})`;
}
