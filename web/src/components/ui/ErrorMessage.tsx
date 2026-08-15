import type { ComponentProps } from 'react';

type ErrorMessageVariant = 'inline' | 'banner' | 'card';
type ErrorMessageSize = 'xs' | 'sm';

type ErrorMessageProps = ComponentProps<'p'> & {
  variant?: ErrorMessageVariant;
  size?: ErrorMessageSize;
  as?: 'p' | 'div';
};

const variantClassName: Record<ErrorMessageVariant, string> = {
  inline: 'text-destructive',
  banner:
    'rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive',
  card:
    'h-fit rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-destructive',
};

const sizeClassName: Record<ErrorMessageSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
};

function ErrorMessage({
  variant = 'inline',
  size = 'sm',
  as: Component = 'p',
  className = '',
  ...props
}: ErrorMessageProps) {
  return (
    <Component
      data-slot="error-message"
      className={`${sizeClassName[size]} ${variantClassName[variant]} ${className}`.trim()}
      {...props}
    />
  );
}

export { ErrorMessage };
export type { ErrorMessageProps, ErrorMessageSize, ErrorMessageVariant };
