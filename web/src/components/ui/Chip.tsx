import * as React from 'react';


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
      className={[
        'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-sm leading-none',
        active
          ? 'border-foreground bg-foreground text-background'
          : 'border-border/80 bg-background text-foreground hover:bg-muted',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
