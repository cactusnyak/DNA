import { Link, useMatches } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { getCategories } from '@/entities/category/api/get-categories';

type BreadcrumbHandle = {
  breadcrumb?: string;
};

type BreadcrumbMatch = {
  id: string;
  pathname: string;
  params: {
    categorySlug?: string;
  };
  handle?: BreadcrumbHandle;
};

export function Breadcrumbs() {
  const matches = useMatches() as BreadcrumbMatch[];

  const categorySlug = matches.find(
    (match) => match.params.categorySlug,
  )?.params.categorySlug;

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    enabled: Boolean(categorySlug),
  });

  const currentCategory = categories?.find(
    (category) => category.slug === categorySlug,
  );

  const breadcrumbItems = matches
    .filter((match) => match.handle?.breadcrumb)
    .map((match) => {
      const isCategoryRoute = Boolean(match.params.categorySlug);

      return {
        id: match.id,
        href: match.pathname,
        label: isCategoryRoute
          ? currentCategory?.name ?? match.params.categorySlug
          : match.handle?.breadcrumb,
      };
    });

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-1 px-4 pt-4 text-sm text-muted-foreground">
      {breadcrumbItems.map((item, index) => {
        const isLastItem = index === breadcrumbItems.length - 1;

        return (
          <div key={item.id} className="flex items-center gap-1">
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