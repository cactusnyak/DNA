import { Search } from 'lucide-react';

import { Input } from './Input';

type SearchInputProps = {
  placeholder?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  className?: string;
};

export function SearchInput({
  placeholder = 'Поиск',
  value,
  onChange,
  className,
}: SearchInputProps) {
  return (
    <label
      className={[
        'flex h-8 flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3',
        'transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
        className,
      ].join(' ')}
    >
      <Search className="size-4 text-muted-foreground" />

      <Input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </label>
  );
}