import type { ReactNode } from 'react';

import type {
  ContentDescription,
  ContentDescriptionBlock,
} from '@/shared/types/content-description';
import { LinkifyText } from '@/shared/utils/linkify';

type DescriptionBlockRenderer = (
  block: ContentDescriptionBlock,
  key: string,
) => ReactNode;

const blockRenderers = {
  heading: (block, key) => (
    <h2 key={key} className="text-lg font-medium">
      <LinkifyText text={block.text} />
    </h2>
  ),
  paragraph: (block, key) => (
    <p key={key} className="text-sm leading-relaxed text-muted-foreground">
      <LinkifyText text={block.text} />
    </p>
  ),
} satisfies Record<ContentDescriptionBlock['type'], DescriptionBlockRenderer>;

type ContentDescriptionEngineProps = {
  description: ContentDescription;
};

export function ContentDescriptionEngine({
  description,
}: ContentDescriptionEngineProps) {
  return description.blocks.map((block, index) =>
    blockRenderers[block.type](block, `${block.type}-${index}`),
  );
}
