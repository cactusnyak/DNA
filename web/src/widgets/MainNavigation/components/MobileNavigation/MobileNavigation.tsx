import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';

import { CartItemsBadge } from '../CartItemsBadge';
import { FavouritesBadge } from '../FavouritesBadge/FavouritesBadge';
import type { MainNavigationItem } from '../../types/main-navigation-item';

type MobileNavigationProps = {
  items: MainNavigationItem[];
};

export function MobileNavigation({ items }: MobileNavigationProps) {
  const columnsCount = items.length;

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-border bg-background md:hidden">
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
            <Button key={item.to} variant="ghost" asChild className="h-12">
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