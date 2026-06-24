import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';

import { CartItemsBadge } from '../CartItemsBadge';
import { navigationItems } from '../../data/navigation-items';

type DesktopNavigationProps = {
  onNavigate?: () => void;
};

export function DesktopNavigation({ onNavigate }: DesktopNavigationProps) {
  return (
    <nav className="ml-auto hidden items-center md:flex">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isCartLink = item.to === '/cart';

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
              </span>

              <span className="hidden lg:inline">{item.label}</span>
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}