import * as React from 'react';


export function Input({
  className,
  type = 'text',
  ...props
}: Omit<React.ComponentProps<'input'>, 'name'> & { name: string }) {
  return (
    <input
      type={type}
      className={[
        'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm leading-none outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    />
  );
}
