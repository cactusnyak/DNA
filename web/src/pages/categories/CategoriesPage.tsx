import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import type { Category } from '@/entities/category';
import { getCategories } from '@/entities/category/api/get-categories';
import { getCategoryHref } from '@/entities/category/utils/category-path';
import { cn } from '@/shared/utils/cn';

function getChildrenCategories(categories: Category[], parentId?: string) {
  return categories.filter((category) => category.parentId === parentId);
}

type CategoryTreeNodeProps = {
  category: Category;
  categories: Category[];
  expandedCategoryIds: Set<string>;
  onToggle: (categoryId: string) => void;
};

function CategoryTreeNode({
  category,
  categories,
  expandedCategoryIds,
  onToggle,
}: CategoryTreeNodeProps) {
  const childrenCategories = getChildrenCategories(categories, category.id);
  const hasChildren = childrenCategories.length > 0;
  const isExpanded = expandedCategoryIds.has(category.id);

  return (
    <li className="space-y-1">
      <div className="flex items-center gap-2 rounded-lg bg-card px-3 py-2">
        <button
          type="button"
          onClick={() => onToggle(category.id)}
          disabled={!hasChildren}
          className={cn(
            'flex size-7 items-center justify-center rounded-md',
            hasChildren
              ? 'cursor-pointer hover:bg-muted'
              : 'cursor-default opacity-30',
          )}
        >
          {isExpanded ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </button>

        <Link
          to={getCategoryHref(categories, category.id)}
          className="text-sm font-medium hover:underline"
        >
          {category.name}
        </Link>
      </div>

      {hasChildren && isExpanded && (
        <ul className="space-y-1 pl-6">
          {childrenCategories.map((childCategory) => (
            <CategoryTreeNode
              key={childCategory.id}
              category={childCategory}
              categories={categories}
              expandedCategoryIds={expandedCategoryIds}
              onToggle={onToggle}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function CategoriesPage() {
  const [searchValue, setSearchValue] = useState('');
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<string>>(
    () => new Set(),
  );

  const {
    data: categories,
    isPending,
    error,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const normalizedSearchValue = searchValue.trim().toLowerCase();

  const visibleCategories = useMemo(() => {
    if (!categories) {
      return [];
    }

    if (!normalizedSearchValue) {
      return categories;
    }

    return categories.filter((category) =>
      category.name.toLowerCase().includes(normalizedSearchValue),
    );
  }, [categories, normalizedSearchValue]);

  function handleToggle(categoryId: string) {
    setExpandedCategoryIds((currentCategoryIds) => {
      const nextCategoryIds = new Set(currentCategoryIds);

      if (nextCategoryIds.has(categoryId)) {
        nextCategoryIds.delete(categoryId);
      } else {
        nextCategoryIds.add(categoryId);
      }

      return nextCategoryIds;
    });
  }

  if (isPending) {
    return <p className="text-muted-foreground">Загрузка категорий...</p>;
  }

  if (error || !categories?.length) {
    return <p className="text-destructive">Не удалось загрузить категории</p>;
  }

  const rootCategories = normalizedSearchValue
    ? visibleCategories
    : getChildrenCategories(visibleCategories);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Все категории</h1>

        <p className="text-sm text-muted-foreground">
          Полное дерево категорий с поиском и раскрытием узлов.
        </p>
      </div>

      <label className="flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3">
        <Search className="size-4 text-muted-foreground" />

        <input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Поиск категории"
          className="h-full w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </label>

      <ul className="space-y-2">
        {rootCategories.map((category) => (
          <CategoryTreeNode
            key={category.id}
            category={category}
            categories={visibleCategories}
            expandedCategoryIds={expandedCategoryIds}
            onToggle={handleToggle}
          />
        ))}
      </ul>
    </div>
  );
}