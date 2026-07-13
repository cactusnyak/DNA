import type { ReactNode } from 'react';
import { forwardRef } from 'react';

import { cn } from '@/shared/utils/cn';
import { SectionTitle } from '@/shared/ui/SectionTitle';

type HorizontalScrollSectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
  onSeeAllClick?: () => void;
  seeAllText?: string;
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
  titleLevel?: 2 | 3;
};

export const HorizontalScrollSection = forwardRef<HTMLDivElement, HorizontalScrollSectionProps>(
  ({ title, children, className, onSeeAllClick, seeAllText = 'Смотреть все', onScroll, titleLevel = 2 }, ref) => {
    return (
      <section className={cn('space-y-4', className)}>
        <div className="flex items-center justify-between">
          <SectionTitle
            title={title}
            onClick={onSeeAllClick}
            level={titleLevel}
          />
          
          {onSeeAllClick && (
            <button
              onClick={onSeeAllClick}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {seeAllText}
            </button>
          )}
        </div>

        <div
          ref={ref}
          onScroll={onScroll}
          className="overflow-x-auto"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <div 
            className="flex gap-4 pb-4" 
            style={{ 
              width: 'fit-content',
              minWidth: '100%'
            }}
          >
            {children}
          </div>
        </div>
      </section>
    );
  }
);

HorizontalScrollSection.displayName = 'HorizontalScrollSection';
