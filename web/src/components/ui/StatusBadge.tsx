import type { ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

export type StatusBadgeVariant =
  | 'default'
  | 'access'
  | 'warning'
  | 'emphasis'
  | 'dangerous'
  | 'destructive'
  | 'muted';

type StatusBadgeProps = Omit<ComponentProps<'span'>, 'children'> & {
  text: string;
  variant?: StatusBadgeVariant;
};

const variantClassNames: Record<StatusBadgeVariant, string> = {
  default: 'bg-status-badge-muted text-status-badge-muted-foreground',
  access: 'bg-success/5 text-success',
  warning: 'bg-warning/5 text-warning',
  emphasis: 'bg-emphasis/10 text-emphasis',
  dangerous: 'bg-dangerous/5 text-dangerous',
  destructive: 'bg-destructive/5 text-destructive',
  muted: 'bg-muted text-muted-foreground',
};

export function StatusBadge({
  text,
  variant = 'default',
  className,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={twMerge(
        'w-fit cursor-inherit rounded-sm px-2 py-1 text-xs underline-offset-4 transition-colors',
        variantClassNames[variant],
        className,
      )}
      {...props}
    >
      {text}
    </span>
  );
}
