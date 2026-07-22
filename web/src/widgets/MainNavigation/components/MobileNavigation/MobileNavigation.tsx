import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { setMobileNavigationHeight } from '@/shared/main-navigation';

import { CartItemsBadge } from '../CartItemsBadge';
import { FavouritesBadge } from '../FavouritesBadge/FavouritesBadge';
import type { MainNavigationItem } from '../../types/main-navigation-item';

type MobileNavigationProps = {
  items: MainNavigationItem[];
};

export function MobileNavigation({ items }: MobileNavigationProps) {
  const columnsCount = items.length;
  const navigationRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = navigationRef.current;

    if (!element) return;

    const updateHeight = () => setMobileNavigationHeight(element.offsetHeight);
    const observer = new ResizeObserver(updateHeight);

    updateHeight();
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <nav
      ref={navigationRef}
      className="fixed right-0 bottom-0 left-0 z-50 border-t border-border bg-background md:hidden"
    >
      <div
        className="mx-auto grid max-w-md gap-1"
        style={{
          gridTemplateColumns: `repeat(${columnsCount}, minmax(0, 1fr))`,
        }}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const isCartLink = item.to === '/cart';
          const isFavouritesLink = item.to === '/favourites';

          return (
            <Button key={item.to} variant="ghost" asChild className="h-15">
              <Link
                to={item.to}
                className="relative flex items-center justify-center"
              >
                <span className="relative">
                  <Icon className="size-4" />

                  {isCartLink && <CartItemsBadge />}
                  {isFavouritesLink && <FavouritesBadge />}
                </span>
              </Link>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
