import { Code } from '@/components/ui/Code';

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
    <Code
      value={value.slice(0, length)}
      title={value}
      className={className}
    />
  );
}
