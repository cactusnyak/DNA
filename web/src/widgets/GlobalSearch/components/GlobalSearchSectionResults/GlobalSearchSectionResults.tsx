import { Link } from 'react-router-dom';

import type { GlobalSearchSection } from '../../types/global-search';

type GlobalSearchSectionResultsProps = {
  sections: GlobalSearchSection[];
  onNavigate: () => void;
};

export function GlobalSearchSectionResults({
  sections,
  onNavigate,
}: GlobalSearchSectionResultsProps) {
  return (
    <section className="p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Разделы</h3>

        <span className="text-xs text-muted-foreground">
          {sections.length}
        </span>
      </div>

      <div className="mt-3 grid gap-1">
        {sections.length > 0 ? (
          sections.map((section) => (
            <Link
              key={section.id}
              to={section.href}
              onClick={onNavigate}
              className="rounded-lg px-3 py-2 transition-colors hover:bg-muted"
            >
              <p className="text-sm font-medium">{section.title}</p>

              <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
                {section.description}
              </p>
            </Link>
          ))
        ) : (
          <p className="rounded-lg bg-muted/40 px-3 py-3 text-sm text-muted-foreground">
            Разделы не найдены.
          </p>
        )}
      </div>
    </section>
  );
}