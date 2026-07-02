import type { ReactNode } from 'react';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

  const parts = text.split(
    new RegExp(`(${escapeRegExp(normalizedSearchValue)})`, 'gi'),
  );

  return (
    <>
      {parts.map((part, index) => {
        const isMatch =
          part.toLowerCase() === normalizedSearchValue.toLowerCase();

        return isMatch ? (
          <mark
            key={`${part}-${index}`}
            className="rounded bg-primary/15 px-0.5 text-foreground"
          >
            {part}
          </mark>
        ) : (
          part
        );
      })}
    </>
  );
}
