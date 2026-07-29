import { Link } from 'react-router-dom';

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
      className={`inline-flex items-center gap-1 rounded-full border border-primary/15 bg-primary/5 p-1 sm:rounded-xl ${className ?? ''}`}
    >
      {options.map((option) => {
        const isActive = option.value === value;

        const itemClass = `inline-flex h-8 flex-1 cursor-pointer items-center justify-center whitespace-nowrap rounded-full px-3.5 text-xs font-medium text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:h-9 sm:rounded-lg sm:px-4 sm:text-sm ${isActive ? 'bg-primary text-primary-foreground ring-1 ring-primary' : 'hover:bg-primary/10 hover:text-primary'}`;

        if (option.href) {
          return (
            <Link
              key={option.value}
              to={option.href}
              aria-current={isActive ? 'page' : undefined}
              className={`${itemClass} lg:flex-none`}
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
