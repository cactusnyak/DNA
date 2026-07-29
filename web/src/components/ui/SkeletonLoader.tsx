
export type SkeletonVariant = 'block' | 'text' | 'card';
export type SkeletonLayout = 'single' | 'grid' | 'stack' | 'inline';

export type SkeletonLoaderProps = {
  variant?: SkeletonVariant;
  layout?: SkeletonLayout;
  count?: number;
  className?: string;
  itemClassName?: string;
  ariaLabel?: string;
};

function SkeletonItem({
  variant,
  className,
}: {
  variant: SkeletonVariant;
  className?: string;
}) {
  if (variant === 'card') {
    return (
      <div
        className={[
          'flex h-full flex-col overflow-hidden rounded-xl p-1',
          className,
        ].filter(Boolean).join(' ')}
      >
        <div className="skeleton-shimmer aspect-square rounded-lg" />
        <div className="space-y-3 p-2">
          <div className="skeleton-shimmer h-4 w-4/5 rounded-md" />
          <div className="skeleton-shimmer h-4 w-3/5 rounded-md" />
          <div className="skeleton-shimmer h-6 w-2/5 rounded-md" />
          <div className="skeleton-shimmer h-9 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={['space-y-2', className].filter(Boolean).join(' ')}>
        <div className="skeleton-shimmer h-4 w-full rounded-md" />
        <div className="skeleton-shimmer h-4 w-5/6 rounded-md" />
        <div className="skeleton-shimmer h-4 w-2/3 rounded-md" />
      </div>
    );
  }

  return (
    <div
      className={['skeleton-shimmer min-h-32 rounded-2xl', className].filter(Boolean).join(' ')}
    />
  );
}

export function SkeletonLoader({
  variant = 'block',
  layout = 'single',
  count = 1,
  className,
  itemClassName,
  ariaLabel = 'Загрузка содержимого',
}: SkeletonLoaderProps) {
  const items = Array.from({ length: Math.max(1, count) });
  const content = items.map((_, index) => (
    <SkeletonItem
      key={index}
      variant={variant}
      className={itemClassName}
    />
  ));

  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={[
        layout === 'grid' &&
          'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4',
        layout === 'stack' && 'flex flex-col gap-4',
        layout === 'inline' && 'flex flex-wrap gap-3',
        className,
      ].filter(Boolean).join(' ')}
    >
      {content}
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
}
