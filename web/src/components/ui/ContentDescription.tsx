import { ContentDescriptionEngine } from '@/shared/content-description';
import type { ContentDescription as ContentDescriptionValue } from '@/shared/types/content-description';
import { cn } from '@/shared/utils/cn';

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
    <section className={cn('space-y-3 pt-2', className)}>
      <ContentDescriptionEngine description={description} />
    </section>
  );
}
