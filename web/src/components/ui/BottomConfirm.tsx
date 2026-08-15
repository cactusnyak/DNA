import type { ReactNode } from 'react';

import { Button } from '@/components/ui/Button';

type BottomConfirmProps = {
  children: ReactNode;
  confirmLabel: ReactNode;
  ariaLabel: string;
  onConfirm: () => void;
  className?: string;
};

export function BottomConfirm({
  children,
  confirmLabel,
  ariaLabel,
  onConfirm,
  className,
}: BottomConfirmProps) {
  return (
    <aside
      className={[
        'fixed inset-x-3 bottom-20 z-50 mx-auto max-w-3xl rounded-2xl border border-primary/12 bg-card p-4 shadow-card-2xl md:bottom-4',
        className,
      ].filter(Boolean).join(' ')}
      aria-label={ariaLabel}
    >
      <div className="flex flex-col gap-4 justify-between">
        <div className="text-sm leading-6 text-muted-foreground">
          {children}
        </div>

        <Button type="button" variant="accent" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </aside>
  );
}
