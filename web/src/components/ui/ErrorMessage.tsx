import type { ComponentProps } from 'react';

type ErrorMessageProps = ComponentProps<'div'>;

function ErrorMessage({ className = '', ...props }: ErrorMessageProps) {
  return (
    <div
      data-slot="error-message"
      className={`h-fit rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive ${className}`.trim()}
      {...props}
    />
  );
}

export { ErrorMessage };
export type { ErrorMessageProps };
