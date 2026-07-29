import type { ReactNode } from 'react';

type ListEndMessageProps = {
  children: ReactNode;
};

export function ListEndMessage({ children }: ListEndMessageProps) {
  return (
    <div className="border-t border-dashed pt-8 md:pt-5 lg:pt-8 xl:pt-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}