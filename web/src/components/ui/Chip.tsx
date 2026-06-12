import * as React from 'react';

import { cn } from '@/shared/utils/cn';

type ChipProps = React.ComponentProps<'button'> & {
  active?: boolean;
};

export function Chip({
  active = false,
  className,
  children,
  ...props
}: ChipProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-sm leading-none transition-colors',
        active
          ? 'border-foreground bg-foreground text-background'
          : 'border-border bg-background text-foreground hover:bg-muted',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}