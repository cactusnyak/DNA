import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { BreadcrumbItem } from '../../types/breadcrumbs';

type BreadcrumbsListProps = {
  items: BreadcrumbItem[];
};

export function BreadcrumbsList({ items }: BreadcrumbsListProps) {
  return (
    <nav
      aria-label="Хлебные крошки"
      className="mx-auto max-w-7xl px-4 pt-5 text-sm text-muted-foreground md:pt-8"
    >
      <ol className="flex min-w-0 items-center gap-1 md:flex-wrap">
        {items.map((item, index) => {
          const isLastItem = index === items.length - 1;
          const isMobileParent = index === items.length - 2;
          const isVisibleOnMobile = isMobileParent || isLastItem;

          return (
            <li
              key={`${item.id}-${item.href}`}
              className={`${isVisibleOnMobile ? 'flex' : 'hidden'} ${isLastItem ? 'flex-1 md:flex-initial' : ''} min-w-0 items-center gap-1 md:flex`}
            >
              {index > 0 && (
                <ChevronRight
                  className={`${isMobileParent ? 'hidden md:block' : ''} size-4 shrink-0`}
                  aria-hidden="true"
                />
              )}

              {isLastItem ? (
                <span
                  className="min-w-0 truncate font-medium text-foreground md:font-normal"
                  aria-current="page"
                  title={item.label}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className={`${isMobileParent ? 'inline-flex shrink-0 items-center gap-0.5 py-1.5 font-medium text-foreground md:py-0 md:font-normal md:text-muted-foreground' : ''} hover:text-foreground`}
                >
                  {isMobileParent && (
                    <ChevronLeft
                      className="size-4 md:hidden"
                      aria-hidden="true"
                    />
                  )}
                  <span className={isMobileParent ? 'md:hidden' : undefined}>
                    {isMobileParent ? 'Назад' : item.label}
                  </span>
                  {isMobileParent && (
                    <span className="hidden md:inline">{item.label}</span>
                  )}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
