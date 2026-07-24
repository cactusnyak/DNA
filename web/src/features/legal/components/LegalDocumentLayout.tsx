import type { LegalDocument } from '@/shared/legal';

import { LegalDocumentMeta } from './LegalDocumentMeta';
import { LegalTableOfContents } from './LegalTableOfContents';

export function LegalDocumentLayout({ document }: { document: LegalDocument }) {
  return (
    <article className="flex flex-col gap-9 rounded-xl bg-white p-6 shadow-[0_0_90px_-10px_rgba(15,23,42,0.10)] sm:m-1 sm:rounded-lg sm:p-8 md:m-2 md:rounded-xl md:p-10 lg:m-3 lg:p-12 xl:m-5 xl:rounded-2xl xl:p-15">
      <LegalDocumentMeta
        title={document.title}
        description={document.description}
        revisionDate={document.revisionDate}
      />

      <div className='flex flex-col gap-6'>
        <section className="flex flex-col gap-4 border-border">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{document.title}</h1>
          <hr />
          <div className="flex flex-col gap-3">
            <p className="leading-7 text-foreground/85">{document.description}</p>
          </div>
        </section>

        <LegalTableOfContents sections={document.sections} />
      </div>

      <section className="flex flex-col gap-9">
        {document.sections.map((section) => (
          <div key={section.id} id={section.id} className="flex scroll-mt-28 flex-col gap-4">
            <h2 className="text-xl font-semibold sm:text-2xl">{section.title}</h2>
            <hr />
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="leading-7 text-foreground/85">{paragraph}</p>
            ))}
            {section.items && (
              <ul className="flex list-disc flex-col gap-2 pl-5 text-foreground/85 marker:text-muted-foreground">
                {section.items.map((item) => <li key={item} className="pl-1 leading-7">{item}</li>)}
              </ul>
            )}
          </div>
        ))}
      </section>
    </article>
  );
}
