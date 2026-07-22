import { useEffect } from 'react';

type LegalDocumentMetaProps = {
  title: string;
  description: string;
};

export function LegalDocumentMeta({ title, description }: LegalDocumentMetaProps) {
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

  return null;
}

