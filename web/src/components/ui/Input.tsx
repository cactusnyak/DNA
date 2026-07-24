import * as React from 'react';

import { cn } from '@/shared/utils/cn';

export function Input({
  className,
  type = 'text',
  ...props
}: Omit<React.ComponentProps<'input'>, 'name'> & { name: string }) {
  return (
    <input
      type={type}
      className={cn(
        'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm leading-none outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}
