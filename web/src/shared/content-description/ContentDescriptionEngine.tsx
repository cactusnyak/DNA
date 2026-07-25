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

type DescriptionBlockGroup = {
  blocks: ContentDescriptionBlock[];
};

function groupDescriptionBlocks(
  blocks: ContentDescriptionBlock[],
): DescriptionBlockGroup[] {
  return blocks.reduce<DescriptionBlockGroup[]>((groups, block) => {
    if (block.type === 'heading' || groups.length === 0) {
      groups.push({ blocks: [block] });
    } else {
      groups.at(-1)?.blocks.push(block);
    }

    return groups;
  }, []);
}

export function ContentDescriptionEngine({
  description,
}: ContentDescriptionEngineProps) {
  const groups = groupDescriptionBlocks(description.blocks);

  return groups.map((group, groupIndex) => (
    <div key={`description-group-${groupIndex}`} className="space-y-3">
      {group.blocks.map((block, blockIndex) =>
        blockRenderers[block.type](
          block,
          `${block.type}-${groupIndex}-${blockIndex}`,
        ),
      )}
    </div>
  ));
}
