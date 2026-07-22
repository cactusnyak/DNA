import { Link } from 'react-router-dom';

import type { CatalogCategory } from '@/shared/types/catalog-category';
import { getCategoryHref } from '@/shared/catalog';
import { PLATFORM_SECTION, type PlatformSectionId } from '@/shared/platform';
import { MarkHighlight } from '@/widgets/MarkHighlight';

type GlobalSearchCategoryResultsProps = {
  marketCategories: CatalogCategory[];
  adsCategories: CatalogCategory[];
  marketCategoryResults: CatalogCategory[];
  adsCategoryResults: CatalogCategory[];
  searchValue: string;
  isPending?: boolean;
  isError?: boolean;
  onNavigate: () => void;
};

export function GlobalSearchCategoryResults({
  marketCategories,
  adsCategories,
  marketCategoryResults,
  adsCategoryResults,
  searchValue,
  isPending = false,
  isError = false,
  onNavigate,
}: GlobalSearchCategoryResultsProps) {
  const categoryResults: Array<{
    category: CatalogCategory;
    allCategories: CatalogCategory[];
    section: PlatformSectionId;
  }> = [
    ...marketCategoryResults.map((category) => ({
      category,
      allCategories: marketCategories,
      section: PLATFORM_SECTION.MARKET,
    })),
    ...adsCategoryResults.map((category) => ({
      category,
      allCategories: adsCategories,
      section: PLATFORM_SECTION.ADS,
    })),
  ];

  return (
    <section className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Категории</h3>

        <span className="text-xs text-muted-foreground">
          {categoryResults.length}
        </span>
      </div>

      <div className="grid gap-1">
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

        {!isPending && !isError && categoryResults.length === 0 && (
          <p className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
            Категории не найдены.
          </p>
        )}

        {!isPending &&
          !isError &&
          categoryResults.map(({ category, allCategories, section }) => (
            <Link
              key={`${section}-${category.id}`}
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

              <div className="min-w-0 py-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-1 text-sm font-medium">
                    <MarkHighlight text={category.name} searchValue={searchValue} level={1} />
                  </p>
                  <span className="shrink-0 rounded-md bg-muted px-1.5 py-1 text-[10px] font-medium leading-none text-muted-foreground">
                    {section === PLATFORM_SECTION.MARKET ? 'Маркет' : 'Доска'}
                  </span>
                </div>

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
