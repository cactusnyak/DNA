import { useQuery } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/entities/auth';
import { getAdminProductAdditionTypes } from '@/entities/admin';
import type { ProductAddition } from '@/entities/product';

type Props = {
  value: ProductAddition[];
  onChange: (value: ProductAddition[]) => void;
};

function createAddition(type: 'boolean' | 'quantity'): ProductAddition {
  const base = {
    id: crypto.randomUUID(),
    title: '',
    price: 0,
    required: false,
  };
  return type === 'boolean'
    ? { ...base, type, defaultValue: false }
    : {
        ...base,
        type,
        defaultValue: 0,
        min: 0,
        max: null,
        unitLabel: 'шт.',
      };
}

export function ProductAdditionsFields({ value, onChange }: Props) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data: types = [], isError } = useQuery({
    queryKey: ['admin-product-addition-types', accessToken],
    queryFn: () => getAdminProductAdditionTypes(accessToken!),
    enabled: Boolean(accessToken),
  });

  function update(index: number, addition: ProductAddition) {
    onChange(value.map((item, itemIndex) => itemIndex === index ? addition : item));
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...value];
    const target = index + direction;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <section className="space-y-4 rounded-xl border border-border p-4">
      <div>
        <h3 className="font-medium">Дополнения</h3>
        <p className="text-sm text-muted-foreground">
          Настройте опции, доступные покупателю на странице товара.
        </p>
      </div>

      {value.map((addition, index) => (
        <div key={addition.id} className="space-y-3 rounded-lg border border-border p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded bg-muted px-2 py-1 text-xs">
              {types.find((type) => type.key === addition.type)?.name ?? addition.type}
            </span>
            <div className="flex gap-1">
              <Button type="button" size="icon" variant="ghost" disabled={index === 0}
                onClick={() => move(index, -1)} aria-label="Переместить вверх">
                <ArrowUp className="size-4" />
              </Button>
              <Button type="button" size="icon" variant="ghost" disabled={index === value.length - 1}
                onClick={() => move(index, 1)} aria-label="Переместить вниз">
                <ArrowDown className="size-4" />
              </Button>
              <Button type="button" size="icon" variant="ghost"
                onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
                aria-label="Удалить дополнение">
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>

          <label className="block space-y-1 text-sm">
            <span>Заголовок</span>
            <input required className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={addition.title}
              onChange={(event) => update(index, { ...addition, title: event.target.value })} />
          </label>
          <label className="block space-y-1 text-sm">
            <span>{addition.type === 'quantity' ? 'Цена за единицу' : 'Цена'}</span>
            <input required type="number" min={0} step={1}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={addition.price}
              onChange={(event) => update(index, { ...addition, price: Number(event.target.value) })} />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={addition.required}
              onChange={(event) => {
                const required = event.target.checked;
                update(index, addition.type === 'quantity'
                  ? { ...addition, required, min: required ? Math.max(1, addition.min) : addition.min }
                  : { ...addition, required });
              }} />
            Обязательное дополнение
          </label>

          {addition.type === 'boolean' ? (
            <label className="block space-y-1 text-sm">
              <span>Значение по умолчанию</span>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={addition.defaultValue === null ? '' : String(addition.defaultValue)}
                onChange={(event) => update(index, {
                  ...addition,
                  defaultValue: event.target.value === '' ? null : event.target.value === 'true',
                })}>
                <option value="">Не задано</option>
                <option value="true">Да</option>
                <option value="false">Нет</option>
              </select>
            </label>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-sm"><span>Обозначение единицы</span>
                <input required className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={addition.unitLabel}
                  onChange={(event) => update(index, { ...addition, unitLabel: event.target.value })} />
              </label>
              <label className="space-y-1 text-sm"><span>Минимум</span>
                <input required type="number" min={addition.required ? 1 : 0} step={1}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={addition.min}
                  onChange={(event) => update(index, { ...addition, min: Number(event.target.value) })} />
              </label>
              <label className="space-y-1 text-sm"><span>Максимум</span>
                <input type="number" min={addition.min} step={1}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={addition.max ?? ''}
                  onChange={(event) => update(index, {
                    ...addition,
                    max: event.target.value === '' ? null : Number(event.target.value),
                  })} />
              </label>
              <label className="space-y-1 text-sm"><span>По умолчанию</span>
                <input type="number" min={addition.min} max={addition.max ?? undefined} step={1}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={addition.defaultValue ?? ''}
                  onChange={(event) => update(index, {
                    ...addition,
                    defaultValue: event.target.value === '' ? null : Number(event.target.value),
                  })} />
              </label>
            </div>
          )}
        </div>
      ))}

      {isError && <p className="text-sm text-destructive">Не удалось загрузить типы дополнений.</p>}
      <div className="flex flex-wrap gap-2">
        {types.map((type) => (
          <Button key={type.key} type="button" variant="outline"
            onClick={() => onChange([...value, createAddition(type.key)])}>
            Добавить: {type.name}
          </Button>
        ))}
      </div>
    </section>
  );
}
