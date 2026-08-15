import type { ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

type StatusBadgeProps = ComponentProps<'span'>;

export function StatusBadge({
  className,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={twMerge(
        'w-fit cursor-inherit rounded-sm px-2 py-1 text-xs underline-offset-4 transition-colors',
        className,
      )}
      {...props}
    />
  );
}
