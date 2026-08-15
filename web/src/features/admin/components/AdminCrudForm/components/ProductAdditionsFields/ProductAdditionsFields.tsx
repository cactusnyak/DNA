import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, Settings2, X } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import {
  FormBooleanField,
  FormInputField,
  FormSelectField,
} from '@/components/ui/FormField';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
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
  const [visibleAdditionId, setVisibleAdditionId] = useState<string | null>(
    value.at(-1)?.id ?? null,
  );
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

  function addAddition(type: 'boolean' | 'quantity') {
    const addition = createAddition(type);
    setVisibleAdditionId(addition.id);
    onChange([...value, addition]);
  }

  function removeAddition(index: number, additionId: string) {
    if (visibleAdditionId === additionId) {
      setVisibleAdditionId(null);
    }
    onChange(value.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <section className="space-y-4 border-y border-primary/12 my-6 px-4 py-6">
      <div>
        <h3 className="font-medium">Дополнения</h3>
        <p className="text-sm text-muted-foreground">
          Настройте опции, доступные покупателю на странице товара.
        </p>
      </div>

      <div className='flex flex-col gap-2'>
        {value.map((addition, index) => (
          <div key={addition.id} className="space-y-3 rounded-2xl border border-primary/12 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="shrink-0 rounded-full bg-muted px-3 py-1.5 text-xs">
                  {types.find((type) => type.key === addition.type)?.name ?? addition.type}
                </span>
                <span
                  className={`truncate text-sm font-medium ${addition.title.trim() ? '' : 'text-muted-foreground'
                    }`}
                >
                  {addition.title.trim() || `Дополнение ${index + 1}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label={
                    visibleAdditionId === addition.id
                      ? 'Скрыть настройки дополнения'
                      : 'Показать настройки дополнения'
                  }
                  aria-expanded={visibleAdditionId === addition.id}
                  onClick={() =>
                    setVisibleAdditionId((currentId) =>
                      currentId === addition.id ? null : addition.id,
                    )
                  }
                >
                  <Settings2 className="size-4" />
                </Button>
                <div className="flex">
                  <Button type="button" size="icon" variant="ghost" disabled={index === 0}
                    onClick={() => move(index, -1)} aria-label="Переместить вверх">
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" disabled={index === value.length - 1}
                    onClick={() => move(index, 1)} aria-label="Переместить вниз">
                    <ArrowDown className="size-4" />
                  </Button>
                </div>
                <Button type="button" size="icon" variant="ghost"
                  onClick={() => removeAddition(index, addition.id)}
                  aria-label="Удалить дополнение">
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            {visibleAdditionId === addition.id && <div className="space-y-3">
              <FormInputField
                name={`additions.${index}.title`}
                required
                label="Заголовок"
                value={addition.title}
                onChange={(event) =>
                  update(index, { ...addition, title: event.target.value })
                }
              />
              <FormInputField
                name={`additions.${index}.price`}
                required
                type="number"
                min={0}
                step={1}
                label={
                  addition.type === 'quantity' ? 'Цена за единицу' : 'Цена'
                }
                value={String(addition.price)}
                onChange={(event) =>
                  update(index, {
                    ...addition,
                    price: Number(event.target.value),
                  })
                }
              />
              <FormBooleanField
                label="Обязательное дополнение"
                variant="toggle"
                checked={addition.required}
                onCheckedChange={(required) => {
                  update(index, addition.type === 'quantity'
                    ? { ...addition, required, min: required ? Math.max(1, addition.min) : addition.min }
                    : { ...addition, required });
                }}
              />

              {addition.type === 'boolean' ? (
                <FormSelectField
                  label="Значение по умолчанию"
                  value={
                    addition.defaultValue === null
                      ? ''
                      : String(addition.defaultValue)
                  }
                  options={[
                    { value: '', label: 'Не задано' },
                    { value: 'true', label: 'Да' },
                    { value: 'false', label: 'Нет' },
                  ]}
                  onValueChange={(nextValue) =>
                    update(index, {
                      ...addition,
                      defaultValue:
                        nextValue === '' ? null : nextValue === 'true',
                    })
                  }
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormInputField
                    name={`additions.${index}.unitLabel`}
                    required
                    label="Обозначение единицы"
                    value={addition.unitLabel}
                    onChange={(event) =>
                      update(index, {
                        ...addition,
                        unitLabel: event.target.value,
                      })
                    }
                  />
                  <FormInputField
                    name={`additions.${index}.min`}
                    required
                    type="number"
                    min={addition.required ? 1 : 0}
                    step={1}
                    label="Минимум"
                    value={String(addition.min)}
                    onChange={(event) =>
                      update(index, {
                        ...addition,
                        min: Number(event.target.value),
                      })
                    }
                  />
                  <FormInputField
                    name={`additions.${index}.max`}
                    type="number"
                    min={addition.min}
                    step={1}
                    label="Максимум"
                    value={addition.max === null ? '' : String(addition.max)}
                    onChange={(event) =>
                      update(index, {
                        ...addition,
                        max:
                          event.target.value === ''
                            ? null
                            : Number(event.target.value),
                      })
                    }
                  />
                  <FormInputField
                    name={`additions.${index}.defaultValue`}
                    type="number"
                    min={addition.min}
                    max={addition.max ?? undefined}
                    step={1}
                    label="По умолчанию"
                    value={
                      addition.defaultValue === null
                        ? ''
                        : String(addition.defaultValue)
                    }
                    onChange={(event) =>
                      update(index, {
                        ...addition,
                        defaultValue:
                          event.target.value === ''
                            ? null
                            : Number(event.target.value),
                      })
                    }
                  />
                </div>
              )}
            </div>}
          </div>
        ))}

        {isError && <ErrorMessage>Не удалось загрузить типы дополнений.</ErrorMessage>}
      </div>

      <div className="space-y-2">
        <p className="text-sm">Добавить тип дополнения:</p>
        <div className="flex flex-wrap gap-2">
          {types.map((type) => (
            <Button
              key={type.key}
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full border border-primary/12 bg-muted/60 px-3 text-xs hover:bg-muted"
              onClick={() => addAddition(type.key)}
            >
              {type.name}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
