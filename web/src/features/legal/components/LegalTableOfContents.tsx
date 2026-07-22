import type { LegalSection } from '@/shared/legal';

export function LegalTableOfContents({ sections }: { sections: LegalSection[] }) {
  if (sections.length < 5) return null;

  return (
    <nav aria-label="Оглавление" className="rounded-2xl border border-border bg-muted/40 p-5">
      <h2 className="font-semibold">Оглавление</h2>
      <ol className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        {sections.map((section) => (
          <li key={section.id}>
            <a className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline" href={`#${section.id}`}>
              {section.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

