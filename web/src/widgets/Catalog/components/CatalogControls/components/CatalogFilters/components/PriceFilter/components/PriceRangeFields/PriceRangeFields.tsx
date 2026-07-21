import { Input } from '@/components/ui/Input';

type PriceRangeFieldsProps = {
  from: number;
  to: number;
  min: number;
  max: number;
  isDisabled?: boolean;
  onFromChange: (value: number) => void;
  onToChange: (value: number) => void;
};

export function PriceRangeFields({
  from,
  to,
  min,
  max,
  isDisabled = false,
  onFromChange,
  onToChange,
}: PriceRangeFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">От</span>

        <Input
          type="number"
          value={from}
          min={min}
          max={max}
          disabled={isDisabled}
          className="h-9"
          onChange={(event) => onFromChange(Number(event.target.value))}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">До</span>

        <Input
          type="number"
          value={to}
          min={min}
          max={max}
          disabled={isDisabled}
          className="h-9"
          onChange={(event) => onToChange(Number(event.target.value))}
        />
      </label>
    </div>
  );
}