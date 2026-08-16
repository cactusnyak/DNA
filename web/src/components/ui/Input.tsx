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
<<<<<<< HEAD
        'w-full rounded-lg border border-border/80 bg-background px-3 py-2 text-sm leading-none outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
=======
        'w-full rounded-lg border border-primary/12 bg-background px-3 py-2 text-sm leading-none outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
>>>>>>> origin/main
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    />
  );
}
