import type { ReactNode } from 'react';

import { cn } from '@/shared/utils/cn';

type SectionHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  className?: string;
};

export function SectionHeader({
  title,
  description,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <h1 className="text-2xl font-semibold">{title}</h1>

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

type SectionTitleProps = {
  children: ReactNode;
  className?: string;
};

export function SectionTitle({ children, className }: SectionTitleProps) {
  return <h2 className={cn('text-sm font-semibold', className)}>{children}</h2>;
}