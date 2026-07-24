import type {
  ProductAddition,
  SelectedProductAddition,
} from '@/entities/product';
import { formatPrice } from '@/shared/utils/format-price';

type Props = {
  additions: ProductAddition[];
  selected: SelectedProductAddition[];
  errors: Record<string, string>;
  onChange: (value: SelectedProductAddition[]) => void;
};

export function ProductAdditionsSelector({
  additions,
  selected,
  errors,
  onChange,
}: Props) {
  const selectedById = new Map(selected.map((item) => [item.additionId, item]));

  function setSelection(next: SelectedProductAddition) {
    onChange([
      ...selected.filter((item) => item.additionId !== next.additionId),
      next,
    ]);
  }

  if (!additions.length) return null;

  return (
    <section className="space-y-3 rounded-xl border border-border p-4">
      <h2 className="font-medium">Дополнения</h2>
      {additions.map((addition) => {
        const selection = selectedById.get(addition.id);
        return (
          <div key={addition.id} className="space-y-2 border-t border-border pt-3 first:border-0 first:pt-0">
            <div className="flex justify-between gap-3 text-sm">
              <span>{addition.title}{addition.required ? ' *' : ''}</span>
              <span className="text-muted-foreground">
                {addition.type === 'boolean'
                  ? `+${formatPrice(addition.price)}`
                  : `${formatPrice(addition.price)}/${addition.unitLabel}`}
              </span>
            </div>
            {addition.type === 'boolean' ? (
              <div className="flex gap-2">
                {[true, false].map((value) => (
                  <button key={String(value)} type="button"
                    className={`rounded-md border px-4 py-2 text-sm ${
                      selection?.type === 'boolean' && selection.value === value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border'
                    }`}
                    onClick={() => setSelection({
                      additionId: addition.id,
                      type: 'boolean',
                      value,
                    })}>
                    {value ? 'Да' : 'Нет'}
                  </button>
                ))}
              </div>
            ) : (
              <input type="number" step={1} min={addition.min}
                max={addition.max ?? undefined}
                className="w-32 rounded-md border border-input bg-background px-3 py-2"
                value={selection?.type === 'quantity' ? selection.value : ''}
                onChange={(event) => {
                  if (event.target.value === '') {
                    onChange(selected.filter((item) => item.additionId !== addition.id));
                    return;
                  }
                  setSelection({
                    additionId: addition.id,
                    type: 'quantity',
                    value: Number(event.target.value),
                  });
                }} />
            )}
            {errors[addition.id] && (
              <p className="text-xs text-destructive">{errors[addition.id]}</p>
            )}
          </div>
        );
      })}
    </section>
  );
}
