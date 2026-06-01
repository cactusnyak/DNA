import { Link } from 'react-router-dom';
import { ShoppingCart, User, WalletCards } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type MainNavigationPlacement = 'header' | 'mobileBottom';

type MainNavigationProps = {
  placement: MainNavigationPlacement;
};

const navigationItems = [
  {
    to: '/referrals',
    label: 'Заработок',
    icon: WalletCards,
  },
  {
    to: '/profile',
    label: 'Профиль',
    icon: User,
  },
  {
    to: '/cart',
    label: 'Корзина',
    icon: ShoppingCart,
  },
];

export function MainNavigation({ placement }: MainNavigationProps) {
  if (placement === 'mobileBottom') {
    return (
      <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-border bg-background px-2 pb-3 pt-2 md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <Button
                key={item.to}
                variant="ghost"
                asChild
                className="h-12 flex-col gap-1"
              >
                <Link to={item.to}>
                  <Icon className="size-4" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav className="ml-auto hidden items-center gap-1 md:flex sm:gap-2">
      {navigationItems.map((item) => {
        const Icon = item.icon;

        return (
          <Button key={item.to} variant="ghost" size="sm" asChild>
            <Link to={item.to} className="gap-2">
              <Icon className="size-4" />
              <span className="hidden lg:inline">{item.label}</span>
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}