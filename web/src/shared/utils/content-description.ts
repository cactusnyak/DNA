import type {
  ContentDescription,
  ContentDescriptionBlock,
} from '@/shared/types/content-description';

export function markdownToContentDescription(
  markdown: string,
): ContentDescription {
  const blocks = markdown
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map<ContentDescriptionBlock>((line) =>
      line.startsWith('# ')
        ? { type: 'heading', text: line.slice(2).trim() }
        : { type: 'paragraph', text: line },
    )
    .filter((block) => block.text.length > 0);

  return { blocks };
}

export function contentDescriptionToMarkdown(
  description?: ContentDescription | null,
): string {
  return (description?.blocks ?? [])
    .map((block) =>
      block.type === 'heading' ? `# ${block.text}` : block.text,
    )
    .join('\n');
}

export function contentDescriptionToPlainText(
  description?: ContentDescription | null,
): string {
  return (description?.blocks ?? []).map((block) => block.text).join('\n');
}
