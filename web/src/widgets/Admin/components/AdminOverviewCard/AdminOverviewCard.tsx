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
    <article className="rounded-2xl border border-border p-5 space-y-4">
      <h4 className="text-sm text-muted-foreground font-semibold">
        {label}
      </h4>

      <div className='space-y-2'>
        <div>
          <span className="text-3xl font-bold">
            {value}
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </div>
    </article>
  );
}