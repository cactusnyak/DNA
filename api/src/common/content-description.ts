import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export type ContentDescriptionBlock = {
  type: 'heading' | 'paragraph';
  text: string;
};

export type ContentDescription = {
  blocks: ContentDescriptionBlock[];
};

function fromMarkdown(value: string): ContentDescription {
  return {
    blocks: value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) =>
        line.startsWith('# ')
          ? { type: 'heading' as const, text: line.slice(2).trim() }
          : { type: 'paragraph' as const, text: line },
      )
      .filter((block) => block.text.length > 0),
  };
}

export function normalizeContentDescription(
  value: unknown,
): ContentDescription {
  if (value === null || value === undefined || value === '') {
    return { blocks: [] };
  }

  if (typeof value === 'string') return fromMarkdown(value);

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestException('description must be an object.');
  }

  const description = value as Record<string, unknown>;

  if (Object.keys(description).some((key) => key !== 'blocks')) {
    throw new BadRequestException('description contains unsupported keys.');
  }

  if (!Array.isArray(description.blocks)) {
    throw new BadRequestException('description.blocks must be an array.');
  }

  return {
    blocks: description.blocks.map((rawBlock, index) => {
      if (
        !rawBlock ||
        typeof rawBlock !== 'object' ||
        Array.isArray(rawBlock)
      ) {
        throw new BadRequestException(
          `description.blocks[${index}] must be an object.`,
        );
      }

      const block = rawBlock as Record<string, unknown>;

      if (Object.keys(block).some((key) => !['type', 'text'].includes(key))) {
        throw new BadRequestException(
          `description.blocks[${index}] contains unsupported keys.`,
        );
      }

      if (block.type !== 'heading' && block.type !== 'paragraph') {
        throw new BadRequestException(
          `description.blocks[${index}].type is not supported.`,
        );
      }

      if (typeof block.text !== 'string' || !block.text.trim()) {
        throw new BadRequestException(
          `description.blocks[${index}].text must be a non-empty string.`,
        );
      }

      return { type: block.type, text: block.text.trim() };
    }),
  };
}

export function contentDescriptionToJson(
  value: unknown,
): Prisma.InputJsonValue {
  return normalizeContentDescription(value);
}

export function contentDescriptionToPlainText(value: unknown): string {
  return normalizeContentDescription(value)
    .blocks.map((block) => block.text)
    .join('\n');
}
