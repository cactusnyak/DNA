import type { LegalSection } from '@/shared/legal';

export function LegalTableOfContents({ sections }: { sections: LegalSection[] }) {
  if (sections.length < 5) return null;

  return (
<<<<<<< HEAD
    <nav aria-label="Оглавление" className="rounded-2xl border border-border/80 bg-muted/40 p-5">
=======
    <nav aria-label="Оглавление" className="rounded-2xl border border-primary/12 bg-muted/40 p-5">
>>>>>>> origin/main
      <h2 className="font-semibold">Оглавление</h2>
      <ol className="flex flex-col gap-3 p-3">
        {sections.map((section) => (
          <li key={section.id}>
            <a className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline text-sm" href={`#${section.id}`}>
              {section.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

