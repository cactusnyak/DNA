import type { ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

export type StatusBadgeVariant =
  | 'default'
  | 'access'
  | 'warning'
  | 'dangerous'
  | 'destructive'
  | 'muted';

type StatusBadgeProps = Omit<ComponentProps<'span'>, 'children'> & {
  text: string;
  variant?: StatusBadgeVariant;
};

const variantClassNames: Record<StatusBadgeVariant, string> = {
  default: 'bg-primary/5 text-primary',
  access: 'bg-success/5 text-success',
  warning: 'bg-warning/5 text-warning',
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
