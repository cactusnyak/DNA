import * as React from 'react';


export function SearchInput({
  className,
  type = 'search',
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
        '[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-cancel-button]:appearance-none',
        '[&::-webkit-search-decoration]:hidden [&::-webkit-search-decoration]:appearance-none',
        '[&::-webkit-search-results-button]:hidden [&::-webkit-search-results-button]:appearance-none',
        '[&::-webkit-search-results-decoration]:hidden [&::-webkit-search-results-decoration]:appearance-none',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    />
  );
}
