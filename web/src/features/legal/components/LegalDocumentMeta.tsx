import { useEffect } from 'react';

type LegalDocumentMetaProps = {
  title: string;
  description: string;
  revisionDate: string;
};

export function LegalDocumentMeta({
  title,
  description,
  revisionDate,
}: LegalDocumentMetaProps) {
  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = meta?.content;

    document.title = `${title} — DNA`;
    meta?.setAttribute('content', description);

    return () => {
      document.title = previousTitle;
      if (meta && previousDescription !== undefined) meta.content = previousDescription;
    };
  }, [description, title]);

  return (
    <p className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1.5 text-xs font-medium text-muted-foreground">
      <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
      Редакция от {revisionDate}
    </p>
  );
}
