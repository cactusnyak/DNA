import { Link, type LinkProps } from 'react-router-dom';

import { cn } from '@/shared/utils/cn';

type TextLinkProps = LinkProps & {
  muted?: boolean;
};

export function TextLink({ className, muted = true, ...props }: TextLinkProps) {
  return (
    <Link
      className={cn(
        'underline-offset-4 transition-colors hover:underline',
        muted
          ? 'text-muted-foreground hover:text-foreground'
          : 'text-foreground hover:text-foreground/80',
        className,
      )}
      {...props}
    />
  );
}