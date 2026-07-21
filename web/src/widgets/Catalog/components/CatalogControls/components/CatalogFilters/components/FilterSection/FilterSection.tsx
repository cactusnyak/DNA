import type { ReactNode } from 'react';

type FilterSectionProps = {
  title: string;
  children: ReactNode;
};

export function FilterSection({ title, children }: FilterSectionProps) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-medium">{title}</h3>
      {children}
    </section>
  );
}