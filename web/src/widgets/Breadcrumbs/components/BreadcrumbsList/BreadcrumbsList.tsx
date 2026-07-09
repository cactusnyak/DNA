import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

import type { BreadcrumbItem } from '../../types/breadcrumbs';

type BreadcrumbsListProps = {
  items: BreadcrumbItem[];
};

export function BreadcrumbsList({ items }: BreadcrumbsListProps) {
  return (
    <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-1 px-4 pt-8 text-sm text-muted-foreground">
      {items.map((item, index) => {
        const isLastItem = index === items.length - 1;

        return (
          <div
            key={`${item.id}-${item.href}`}
            className="flex items-center gap-1"
          >
            {index > 0 && <ChevronRight className="size-4" />}

            {isLastItem ? (
              <span className="text-foreground">{item.label}</span>
            ) : (
              <Link to={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}