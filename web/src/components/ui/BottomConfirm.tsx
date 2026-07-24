import type { ReactNode } from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/shared/utils/cn';

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
      className={cn(
        'fixed inset-x-3 bottom-20 z-50 mx-auto max-w-3xl rounded-2xl border border-border bg-card p-4 shadow-xl md:bottom-4',
        className,
      )}
      aria-label={ariaLabel}
    >
      <div className="flex flex-col gap-4 justify-between">
        <div className="text-sm leading-6 text-muted-foreground">
          {children}
        </div>

        <Button type="button" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </aside>
  );
}
