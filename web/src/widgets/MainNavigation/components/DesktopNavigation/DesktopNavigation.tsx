import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';

import { navigationItems } from '../../data/navigation-items';

export function DesktopNavigation() {
  return (
    <nav className="ml-auto hidden items-center gap-1 md:flex sm:gap-2">
      {navigationItems.map((item) => {
        const Icon = item.icon;

        return (
          <Button
            key={item.to}
            variant="ghost"
            size="sm"
            asChild
          >
            <Link to={item.to} className="gap-2">
              <Icon className="size-4" />

              <span className="hidden lg:inline">
                {item.label}
              </span>
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}