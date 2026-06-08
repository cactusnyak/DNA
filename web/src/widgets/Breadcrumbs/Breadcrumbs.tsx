import { Link, useMatches } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import type { Category } from '@/entities/category';
import { getCategories } from '@/entities/category/api/get-categories';
import { getCategoryHref } from '@/entities/category/utils/category-path';

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

type BreadcrumbItem = {
  id: string;
  href: string;
  label: string;
};

type BreadcrumbsProps = {
  root?: BreadcrumbItem;
};

const defaultRoot: BreadcrumbItem = {
  id: 'home',
  href: '/',
  label: 'Главная',
};

function getCategoryPath(
  categories: Category[],
  currentCategorySlug: string,
): BreadcrumbItem[] {
  const categoryBySlug = new Map<string, Category>();
  const categoryById = new Map<string, Category>();

  categories.forEach((category) => {
    categoryBySlug.set(category.slug, category);
    categoryById.set(category.id, category);
  });

  const currentCategory = categoryBySlug.get(currentCategorySlug);

  if (!currentCategory) {
    return [
      {
        id: `category-${currentCategorySlug}`,
        href: `/catalog/${currentCategorySlug}`,
        label: currentCategorySlug,
      },
    ];
  }

  const categoryPath: Category[] = [];
  let category: Category | undefined = currentCategory;

  while (category) {
    categoryPath.unshift(category);

    if (!category.parentId) {
      break;
    }

    category = categoryById.get(category.parentId);
  }

  return categoryPath.map((category) => ({
    id: `category-${category.id}`,
    href: getCategoryHref(categories, category.id),
    label: category.name,
  }));
}

function removeDuplicateBreadcrumbs(items: BreadcrumbItem[]) {
  const usedHrefs = new Set<string>();

  return items.filter((item) => {
    if (usedHrefs.has(item.href)) {
      return false;
    }

    usedHrefs.add(item.href);
    return true;
  });
}

export function Breadcrumbs({ root = defaultRoot }: BreadcrumbsProps) {
  const matches = useMatches() as BreadcrumbMatch[];

  const isHomePage = matches.some(
    (match) => match.pathname === root.href && match.handle?.breadcrumb,
  );

  const categorySlug = matches.find(
    (match) => match.params.categorySlug,
  )?.params.categorySlug;

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    enabled: Boolean(categorySlug),
  });

  const routeBreadcrumbItems = matches
    .filter((match) => match.handle?.breadcrumb)
    .flatMap<BreadcrumbItem>((match) => {
      const breadcrumb = match.handle?.breadcrumb;

      if (breadcrumb === root.label && match.pathname === root.href) {
        return [];
      }

      if (breadcrumb === 'Каталог') {
        return [
          {
            id: 'catalog',
            href: '/catalog',
            label: 'Каталог',
          },
        ];
      }

      if (breadcrumb === 'Категория' && categorySlug) {
        return getCategoryPath(categories ?? [], categorySlug);
      }

      return [
        {
          id: match.id,
          href: match.pathname,
          label: breadcrumb ?? '',
        },
      ];
    });

  const breadcrumbItems = isHomePage
    ? []
    : removeDuplicateBreadcrumbs([root, ...routeBreadcrumbItems]);

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-1 px-4 pt-4 text-sm text-muted-foreground">
      {breadcrumbItems.map((item, index) => {
        const isLastItem = index === breadcrumbItems.length - 1;

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