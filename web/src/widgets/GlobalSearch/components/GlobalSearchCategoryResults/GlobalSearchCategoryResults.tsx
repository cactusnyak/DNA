import { Link } from 'react-router-dom';

import type { CatalogCategory } from '@/shared/types/catalog-category';
import { getCategoryHref } from '@/shared/catalog';
import type { PlatformSectionId } from '@/shared/platform';
import { MarkHighlight } from '@/shared/ui/MarkHighlight';

type GlobalSearchCategoryResultsProps = {
  section: PlatformSectionId;
  categories: CatalogCategory[];
  allCategories: CatalogCategory[];
  searchValue: string;
  isPending?: boolean;
  isError?: boolean;
  onNavigate: () => void;
};

export function GlobalSearchCategoryResults({
  section,
  categories,
  allCategories,
  searchValue,
  isPending = false,
  isError = false,
  onNavigate,
}: GlobalSearchCategoryResultsProps) {
  return (
    <section className="p-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Категории</h3>

        <span className="text-xs text-muted-foreground">
          {categories.length}
        </span>
      </div>

      <div className="mt-3 grid gap-1">
        {isPending && (
          <p className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
            Ищем категории...
          </p>
        )}

        {isError && (
          <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            Не удалось загрузить категории.
          </p>
        )}

        {!isPending && !isError && categories.length === 0 && (
          <p className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
            Категории не найдены.
          </p>
        )}

        {!isPending &&
          !isError &&
          categories.map((category) => (
            <Link
              key={category.id}
              to={getCategoryHref(allCategories, category.id, section)}
              onClick={onNavigate}
              className="grid grid-cols-[56px_minmax(0,1fr)] gap-3 rounded-xl p-2 transition-colors hover:bg-muted"
            >
              <div className="size-14 overflow-hidden rounded-md bg-muted">
                {category.image ? (
                  <img
                    src={category.image.url}
                    alt={category.image.alt ?? category.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
                    {category.name.slice(0, 1)}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <p className="line-clamp-1 text-sm font-medium">
                  <MarkHighlight text={category.name} searchValue={searchValue} level={1} />
                </p>

                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  {category.description ? (
                    <MarkHighlight text={category.description} searchValue={searchValue} level={2} />
                  ) : (
                    <MarkHighlight text={category.path} searchValue={searchValue} level={2} />
                  )}
                </p>
              </div>
            </Link>
          ))}
      </div>
    </section>
  );
}

