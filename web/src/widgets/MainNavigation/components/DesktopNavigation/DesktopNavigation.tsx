import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';

import { CartItemsBadge } from '../CartItemsBadge';
import { FavouritesBadge } from '../FavouritesBadge/FavouritesBadge';
import type { MainNavigationItem } from '../../types/main-navigation-item';

type DesktopNavigationProps = {
  items: MainNavigationItem[];
  onNavigate?: () => void;
};

export function DesktopNavigation({
  items,
  onNavigate,
}: DesktopNavigationProps) {
  return (
    <nav className="ml-auto hidden items-center md:flex">
      {items.map((item) => {
        const Icon = item.icon;
        const isCartLink = item.to === '/cart';
        const isFavouritesLink = item.to === '/favourites';

        return (
          <Button key={item.to} variant="ghost" size="sm" asChild>
            <Link
              to={item.to}
              onClick={onNavigate}
              className="relative gap-2"
            >
              <span className="relative">
                <Icon className="size-4" />

                {isCartLink && <CartItemsBadge />}
                {isFavouritesLink && <FavouritesBadge />}
              </span>

              <span className="hidden lg:inline">{item.label}</span>
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}