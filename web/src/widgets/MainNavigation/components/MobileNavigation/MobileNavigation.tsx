import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';

import { navigationItems } from '../../data/navigation-items';

export function MobileNavigation() {
  const columnsCount = navigationItems.length;

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-border bg-background md:hidden">
      <div
        className="mx-auto grid max-w-md gap-1"
        style={{
          gridTemplateColumns: `repeat(${columnsCount}, minmax(0, 1fr))`,
        }}
      >
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <Button
              key={item.to}
              variant="ghost"
              asChild
              className="h-12"
            >
              <Link
                to={item.to}
                className="flex items-center justify-center"
              >
                <Icon className="size-4" />
              </Link>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}