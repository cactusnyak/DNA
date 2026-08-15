import { twMerge } from 'tailwind-merge';

type AdminShortIdProps = {
  value: string;
  length?: number;
  className?: string;
};

export function AdminShortId({
  value,
  length = 8,
  className,
}: AdminShortIdProps) {
  return (
    <code
      title={value}
      className={twMerge(
        'truncate rounded bg-muted px-1 py-0.5 text-xs font-mono',
        className,
      )}
    >
      {value.slice(0, length)}
    </code>
  );
}
