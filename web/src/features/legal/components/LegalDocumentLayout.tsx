import type { LegalDocument } from '@/shared/legal';

import { LegalDocumentMeta } from './LegalDocumentMeta';
import { LegalRevisionDate } from './LegalRevisionDate';
import { LegalTableOfContents } from './LegalTableOfContents';

export function LegalDocumentLayout({ document }: { document: LegalDocument }) {
  return (
    <article className="mx-auto max-w-4xl space-y-8">
      <LegalDocumentMeta title={document.title} description={document.description} />

      <header className="space-y-3 border-b border-border pb-6">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{document.title}</h1>
        <p className="max-w-3xl leading-7 text-muted-foreground">{document.description}</p>
        <LegalRevisionDate value={document.revisionDate} />
      </header>

      <LegalTableOfContents sections={document.sections} />

      <div className="space-y-9">
        {document.sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-28 space-y-4">
            <h2 className="text-xl font-semibold sm:text-2xl">{section.title}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="leading-7 text-foreground/85">{paragraph}</p>
            ))}
            {section.items && (
              <ul className="list-disc space-y-2 pl-5 text-foreground/85 marker:text-muted-foreground">
                {section.items.map((item) => <li key={item} className="pl-1 leading-7">{item}</li>)}
              </ul>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}

