import { useEffect, useRef } from 'react';

import { useHeaderStore } from '@/shared/header';

type ScrollHideBreakpoint = {
  minWidth: number;
  topOffset: number;
  hideThreshold: number;
  showThreshold: number;
};

const SCROLL_HIDE_BREAKPOINTS: ScrollHideBreakpoint[] = [
  { minWidth: 1024, topOffset: 80, hideThreshold: 4,  showThreshold: 2  },
  { minWidth: 768,  topOffset: 60, hideThreshold: 8,  showThreshold: 6  },
  { minWidth: 0,    topOffset: 40, hideThreshold: 16, showThreshold: 12 },
];

function getBreakpoint(): ScrollHideBreakpoint {
  const width = window.innerWidth;
  return (
    SCROLL_HIDE_BREAKPOINTS.find((bp) => width >= bp.minWidth) ??
    SCROLL_HIDE_BREAKPOINTS[SCROLL_HIDE_BREAKPOINTS.length - 1]
  );
}

export function useScrollHide() {
  const setIsHidden = useHeaderStore((s) => s.setIsHidden);
  const isHidden = useHeaderStore((s) => s.isHidden);

  const lastScrollY = useRef(window.scrollY);
  const breakpointRef = useRef(getBreakpoint());

  useEffect(() => {
    const onResize = () => {
      breakpointRef.current = getBreakpoint();
    };

    const handleScroll = () => {
      const { topOffset, hideThreshold, showThreshold } = breakpointRef.current;
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - lastScrollY.current;

      if (currentScrollY < topOffset) {
        setIsHidden(false);
      } else if (diff > hideThreshold) {
        setIsHidden(true);
      } else if (diff < -showThreshold) {
        setIsHidden(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [setIsHidden]);

  return { isHidden };
}
