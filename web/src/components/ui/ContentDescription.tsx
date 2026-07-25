import type { ContentDescription as ContentDescriptionValue } from '@/shared/types/content-description';
import { cn } from '@/shared/utils/cn';
import { LinkifyText } from '@/shared/utils/linkify';

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
      {description.blocks.map((block, index) =>
        block.type === 'heading' ? (
          <h2 key={`${block.type}-${index}`} className="text-lg font-semibold">
            <LinkifyText text={block.text} />
          </h2>
        ) : (
          <p
            key={`${block.type}-${index}`}
            className="text-sm leading-relaxed text-muted-foreground"
          >
            <LinkifyText text={block.text} />
          </p>
        ),
      )}
    </section>
  );
}
