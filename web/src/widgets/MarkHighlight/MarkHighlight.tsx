import { useMemo } from 'react';

type MarkHighlightProps = {
  text: string;
  searchValue: string;
  className?: string;
};

export function MarkHighlight({
  text,
  searchValue,
  className,
}: MarkHighlightProps) {
  const highlightedText = useMemo(() => {
    const normalizedSearchValue = searchValue.trim().toLowerCase();

    if (!normalizedSearchValue) {
      return text;
    }

    const regex = new RegExp(`(${normalizedSearchValue})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      const isHighlight = regex.test(part);
      regex.lastIndex = 0;

      return isHighlight ? (
        <mark
          key={index}
          className={['rounded-[4px]', 'bg-yellow-100 text-yellow-800', className]
            .filter(Boolean)
            .join(' ')}
        >
          {part}
        </mark>
      ) : part;
    });
  }, [text, searchValue, className]);

  return <span>{highlightedText}</span>;
}
