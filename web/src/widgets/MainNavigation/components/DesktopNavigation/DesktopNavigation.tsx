import { NavLink } from 'react-router-dom';

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
    <nav className="flex gap-1 hidden items-center md:flex">
      {items.filter((item) => !item.mobileOnly).map((item) => {
        const Icon = item.icon;
        const isCartLink = item.to === '/cart';
        const isFavouritesLink = item.to === '/favourites';

        return (
          <Button key={item.to} variant="ghost" size="sm" asChild>
            <NavLink
              to={item.to}
              end={item.to === '/'}
              onClick={onNavigate}
              className="relative gap-2 aria-[current=page]:border-primary/15 aria-[current=page]:bg-primary/5 aria-[current=page]:text-primary"
            >
              <span className="relative">
                <Icon className="size-4" />

                {isCartLink && <CartItemsBadge />}
                {isFavouritesLink && <FavouritesBadge />}
              </span>

              <span className="inline">{item.label}</span>
            </NavLink>
          </Button>
        );
      })}
    </nav>
  );
}
