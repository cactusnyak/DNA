import type { ReactNode } from 'react';

type AdminOverviewCardProps = {
  label: ReactNode;
  value: ReactNode;
  description: ReactNode;
};

export function AdminOverviewCard({
  label,
  value,
  description,
}: AdminOverviewCardProps) {
  return (
    <article className="rounded-2xl border border-border p-5">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 text-3xl font-semibold tracking-tight">
        {value}
      </p>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </article>
  );
}