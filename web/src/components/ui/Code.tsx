import type { ComponentProps, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

type CodeProps = Omit<ComponentProps<'code'>, 'children'> & {
  value: ReactNode;
};

export function Code({ value, className, ...props }: CodeProps) {
  return (
    <code
      className={twMerge(
        'truncate rounded bg-muted px-1 py-0.5 font-mono text-xs',
        className,
      )}
      {...props}
    >
      {value}
    </code>
  );
}
