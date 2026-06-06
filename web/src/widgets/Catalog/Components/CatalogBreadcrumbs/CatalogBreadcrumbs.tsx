import { Link } from 'react-router-dom';

import type { CategoryBreadcrumb } from '../../logic/get-category-breadcrumbs';

type CatalogBreadcrumbsProps = {
  breadcrumbs: CategoryBreadcrumb[];
};

export function CatalogBreadcrumbs({ breadcrumbs }: CatalogBreadcrumbsProps) {
  return (
    <nav aria-label="Хлебные крошки" className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-2">
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li key={breadcrumb.href} className="flex items-center gap-2">
              {index > 0 && <span>/</span>}

              {isLast ? (
                <span className="font-medium text-foreground">
                  {breadcrumb.label}
                </span>
              ) : (
                <Link to={breadcrumb.href} className="hover:text-foreground">
                  {breadcrumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}