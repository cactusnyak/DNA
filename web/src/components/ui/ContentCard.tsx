import type { ReactNode } from 'react';

type ContentCardProps = {
  children: ReactNode;
  as?: 'div' | 'section';
  className?: string;
};

export function ContentCard({
  children,
  as: Component = 'div',
  className = '',
}: ContentCardProps) {
  return (
    <Component
      className={`space-y-8 md:rounded-3xl md:bg-page md:p-5 md:shadow-card-2xl lg:p-8 xl:p-10 ${className}`}
    >
      {children}
    </Component>
  );
}
