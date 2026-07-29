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
    <section className={['space-y-3 pt-2', className].filter(Boolean).join(' ')}>
      <ContentDescriptionEngine description={description} />
    </section>
  );
}
