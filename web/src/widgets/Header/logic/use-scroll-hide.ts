import { useEffect, useRef } from 'react';

import { useHeaderStore } from '@/shared/header';

type UseScrollHideOptions = {
  threshold?: number;
};

export function useScrollHide({ threshold = 80 }: UseScrollHideOptions = {}) {
  const setIsHidden = useHeaderStore((s) => s.setIsHidden);
  const isHidden = useHeaderStore((s) => s.isHidden);
  const lastScrollY = useRef(window.scrollY);
  const thresholdRef = useRef(threshold);
  thresholdRef.current = threshold;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - lastScrollY.current;

      if (currentScrollY < thresholdRef.current) {
        setIsHidden(false);
      } else if (diff > 2) {
        setIsHidden(true);
      } else if (diff < -2) {
        setIsHidden(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setIsHidden]);

  return { isHidden };
}
