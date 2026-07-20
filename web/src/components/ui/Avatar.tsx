import { cn } from '@/shared/utils/cn';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

type AvatarProps = {
  src?: string;
  name: string;
  size?: AvatarSize;
  className?: string;
};

const sizeClassNames: Record<AvatarSize, string> = {
  sm: 'size-8 text-xs',
  md: 'size-12 text-sm',
  lg: 'size-20 text-xl',
  xl: 'size-28 text-3xl',
};

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const initial = name.charAt(0).toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          'rounded-full object-cover',
          sizeClassNames[size],
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground',
        sizeClassNames[size],
        className,
      )}
      aria-label={name}
    >
      {initial}
    </div>
  );
}
