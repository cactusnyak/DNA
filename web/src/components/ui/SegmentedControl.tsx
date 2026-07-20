import { Link } from 'react-router-dom';

import { cn } from '@/shared/utils/cn';

export type SegmentedControlOption<T extends string> = {
  value: T;
  label: React.ReactNode;
  href?: string;
};

type SegmentedControlProps<T extends string> = {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange?: (value: T) => void;
  className?: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-xl border border-border bg-muted/50 p-1',
        className,
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value;

        const itemClass = cn(
          'inline-flex h-9 flex-1 cursor-pointer items-center justify-center rounded-md px-4 text-sm font-medium text-muted-foreground transition-colors whitespace-nowrap',
          'hover:bg-background hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isActive && 'bg-background text-foreground ring-1 ring-border',
        );

        if (option.href) {
          return (
            <Link
              key={option.value}
              to={option.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(itemClass, 'lg:flex-none')}
            >
              {option.label}
            </Link>
          );
        }

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            className={itemClass}
            onClick={() => onChange?.(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
