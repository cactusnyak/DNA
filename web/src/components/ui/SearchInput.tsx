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
        'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm leading-none outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
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
