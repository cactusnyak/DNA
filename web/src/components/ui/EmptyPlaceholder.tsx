import type { ComponentProps } from 'react';

type EmptyPlaceholderProps = ComponentProps<'div'>;

function EmptyPlaceholder({
  className = '',
  ...props
}: EmptyPlaceholderProps) {
  return (
    <div
      data-slot="empty-placeholder"
      className={`h-fit rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground ${className}`}
      {...props}
    />
  );
}

export { EmptyPlaceholder };