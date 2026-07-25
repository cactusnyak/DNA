import { BadRequestException } from '@nestjs/common';

import {
  contentDescriptionToPlainText,
  normalizeContentDescription,
} from './content-description';

describe('content descriptions', () => {
  it('converts the supported markdown syntax into blocks', () => {
    expect(
      normalizeContentDescription('# Заголовок\nПервый абзац\n\nВторой абзац'),
    ).toEqual({
      blocks: [
        { type: 'heading', text: 'Заголовок' },
        { type: 'paragraph', text: 'Первый абзац' },
        { type: 'paragraph', text: 'Второй абзац' },
      ],
    });
  });

  it('normalizes a JSON description', () => {
    expect(
      normalizeContentDescription({
        blocks: [{ type: 'paragraph', text: ' Текст ' }],
      }),
    ).toEqual({ blocks: [{ type: 'paragraph', text: 'Текст' }] });
  });

  it('returns plain text for moderation and search', () => {
    expect(
      contentDescriptionToPlainText({
        blocks: [
          { type: 'heading', text: 'Заголовок' },
          { type: 'paragraph', text: 'Текст' },
        ],
      }),
    ).toBe('Заголовок\nТекст');
  });

  it('rejects unsupported blocks', () => {
    expect(() =>
      normalizeContentDescription({
        blocks: [{ type: 'html', text: '<script />' }],
      }),
    ).toThrow(BadRequestException);
  });
});
