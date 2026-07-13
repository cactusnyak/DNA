import type { ReactNode } from 'react';

import { MarkHighlight } from '@/widgets/MarkHighlight';

export function renderHighlightedText(
  value: ReactNode,
  searchValue: string,
): ReactNode {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return value;
  }

  const text = String(value);
  const normalizedSearchValue = searchValue.trim();

  if (!normalizedSearchValue) {
    return text;
  }

  return (
    <MarkHighlight 
      text={text} 
      searchValue={searchValue} 
      level={1}
    />
  );
}
