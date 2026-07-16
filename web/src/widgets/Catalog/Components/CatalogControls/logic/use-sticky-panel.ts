import { type RefObject, useEffect, useRef } from 'react';

import { HEADER_ANIMATION_DURATION_MS, HEADER_ANIMATION_EASING, getHeaderHeight, useHeaderStore } from '@/shared/header';

type UseStickyPanelOptions = {
  sentinelRef: RefObject<HTMLDivElement | null>;
  panelRef: RefObject<HTMLDivElement | null>;
  containerRef?: RefObject<HTMLDivElement | null>;
};

export function useStickyPanel({
  sentinelRef,
  panelRef,
  containerRef,
}: UseStickyPanelOptions) {
  const isHeaderHidden = useHeaderStore((s) => s.isHidden);
  const isHeaderHiddenRef = useRef(isHeaderHidden);
  isHeaderHiddenRef.current = isHeaderHidden;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const panel = panelRef.current;
    const container = containerRef?.current ?? null;
    if (!sentinel || !panel) return;

    panel.style.transition = `top ${HEADER_ANIMATION_DURATION_MS}ms ${HEADER_ANIMATION_EASING}`;

    const reset = () => {
      panel.style.position = '';
      panel.style.top = '';
      panel.style.left = '';
      panel.style.width = '';
      sentinel.style.minHeight = '';
    };

    const update = () => {
      if (window.innerWidth < 1024) {
        reset();
        return;
      }

      const headerHeight = getHeaderHeight();
      const gap = 16;
      const effectiveHeaderHeight = isHeaderHiddenRef.current ? 0 : headerHeight;
      const stickyTop = effectiveHeaderHeight + gap;

      const panelHeight = panel.offsetHeight;
      sentinel.style.minHeight = `${panelHeight}px`;

      const sentinelRect = sentinel.getBoundingClientRect();

      if (sentinelRect.top > stickyTop) {
        reset();
        return;
      }

      const containerBottom = container
        ? container.getBoundingClientRect().bottom
        : sentinelRect.bottom;
      const maxTop = containerBottom - panelHeight;
      const top = Math.min(stickyTop, maxTop);

      panel.style.position = 'fixed';
      panel.style.top = `${top}px`;
      panel.style.left = `${sentinelRect.left}px`;
      panel.style.width = `${sentinel.offsetWidth}px`;
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [sentinelRef, panelRef, containerRef]);
}
