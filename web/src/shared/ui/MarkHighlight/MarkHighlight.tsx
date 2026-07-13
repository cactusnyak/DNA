import { useMemo } from 'react';

import { cn } from '@/shared/utils/cn';

export type MarkLevel = 1 | 2 | 3;

type MarkHighlightProps = {
  text: string;
  searchValue: string;
  level?: MarkLevel;
  className?: string;
};

const levelStyles = {
  1: 'bg-yellow-100 text-yellow-800',
  2: 'bg-yellow-200 text-yellow-900', 
  3: 'bg-orange-200 text-orange-900',
};

export function MarkHighlight({ 
  text, 
  searchValue, 
  level = 1,
  className 
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
          className={cn(
            'rounded-[4px] px-0.5',
            levelStyles[level],
            className
          )}
        >
          {part}
        </mark>
      ) : part;
    });
  }, [text, searchValue, level, className]);

  return <span>{highlightedText}</span>;
}
