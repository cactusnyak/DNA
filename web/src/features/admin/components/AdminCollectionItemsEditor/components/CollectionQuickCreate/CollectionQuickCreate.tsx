import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type CollectionQuickCreateProps = {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onCreate: () => void;
};

export function CollectionQuickCreate({
  value,
  placeholder,
  onChange,
  onCreate,
}: CollectionQuickCreateProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />

      <Button type="button" variant="outline" onClick={onCreate}>
        Быстро создать
      </Button>
    </div>
  );
}
