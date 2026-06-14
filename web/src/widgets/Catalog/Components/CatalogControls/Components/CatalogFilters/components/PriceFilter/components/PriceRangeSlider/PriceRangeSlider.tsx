import { cn } from '@/shared/utils/cn';

type PriceRangeSliderProps = {
  from: number;
  to: number;
  min: number;
  max: number;
  leftPercent: number;
  rightPercent: number;
  isDisabled?: boolean;
  onFromChange: (value: number) => void;
  onToChange: (value: number) => void;
  onCommit: () => void;
};

const rangeInputClassName = cn(
  'pointer-events-none absolute inset-x-0 top-0 h-6 w-full appearance-none bg-transparent',
  '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground',
  '[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-foreground',
);

export function PriceRangeSlider({
  from,
  to,
  min,
  max,
  leftPercent,
  rightPercent,
  isDisabled = false,
  onFromChange,
  onToChange,
  onCommit,
}: PriceRangeSliderProps) {
  return (
    <div className="relative h-6">
      <div className="absolute right-0 left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-muted" />

      <div
        className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-foreground"
        style={{
          left: `${leftPercent}%`,
          right: `${100 - rightPercent}%`,
        }}
      />

      <input
        type="range"
        min={min}
        max={max}
        value={from}
        disabled={isDisabled}
        className={rangeInputClassName}
        onChange={(event) => onFromChange(Number(event.target.value))}
        onMouseUp={onCommit}
        onTouchEnd={onCommit}
        onKeyUp={onCommit}
      />

      <input
        type="range"
        min={min}
        max={max}
        value={to}
        disabled={isDisabled}
        className={rangeInputClassName}
        onChange={(event) => onToChange(Number(event.target.value))}
        onMouseUp={onCommit}
        onTouchEnd={onCommit}
        onKeyUp={onCommit}
      />
    </div>
  );
}