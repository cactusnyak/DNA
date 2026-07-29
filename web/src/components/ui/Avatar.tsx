
type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

type AvatarProps = {
  src?: string;
  name: string;
  size?: AvatarSize;
  className?: string;
};

const sizeClassNames: Record<AvatarSize, string> = {
  sm: 'size-10 text-sm',
  md: 'size-15 text-2xl',
  lg: 'size-25 text-3xl',
  xl: 'size-40 text-4xl',
};

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const initial = name.charAt(0).toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={[
          'rounded-full object-cover',
          sizeClassNames[size],
          className,
        ].filter(Boolean).join(' ')}
      />
    );
  }

  return (
    <div
      className={[
        'flex shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground',
        sizeClassNames[size],
        className,
      ].filter(Boolean).join(' ')}
      aria-label={name}
    >
      {initial}
    </div>
  );
}
