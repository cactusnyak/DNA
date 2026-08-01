import { ContentDescriptionEngine } from '@/shared/content-description';
import type { ContentDescription as ContentDescriptionValue } from '@/shared/types/content-description';

type ContentDescriptionProps = {
  description: ContentDescriptionValue;
  className?: string;
};

export function ContentDescription({
  description,
  className,
}: ContentDescriptionProps) {
  if (!description.blocks.length) return null;

  return (
    <section
      className={[
        'flex flex-col gap-4 rounded-xl shadow-card-md p-4 bg-white md:shadow-none md:p-0',
        className,
      ].filter(Boolean).join(' ')}
    >
      <h2 className="text-lg font-medium">Описание</h2>
      <ContentDescriptionEngine description={description} />
    </section>
  );
}
