import { FormInputField } from '@/components/ui/FormField';

import type {
  AdminCrudFormValues,
  AdminCrudUpdateValue,
} from '../../types/admin-crud-form';

type LocationCrudFieldsProps = {
  values: AdminCrudFormValues;
  onValueChange: AdminCrudUpdateValue;
  plain?: boolean;
};

export function LocationCrudFields({
  values,
  onValueChange,
  plain = false,
}: LocationCrudFieldsProps) {
  const fields = (
    <>
      <FormInputField
        name="locationName"
        label="Название точки"
        caption="Оставьте весь блок пустым, если геопозиция не нужна."
        value={String(values.locationName ?? '')}
        onChange={(event) => onValueChange('locationName', event.target.value)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormInputField
          name="locationLatitude"
          type="number"
          inputMode="decimal"
          min={-90}
          max={90}
          step={0.000001}
          label="Широта"
          value={String(values.locationLatitude ?? '')}
          onChange={(event) =>
            onValueChange('locationLatitude', event.target.value)
          }
        />

        <FormInputField
          name="locationLongitude"
          type="number"
          inputMode="decimal"
          min={-180}
          max={180}
          step={0.000001}
          label="Долгота"
          value={String(values.locationLongitude ?? '')}
          onChange={(event) =>
            onValueChange('locationLongitude', event.target.value)
          }
        />
      </div>
    </>
  );

  if (plain) {
    return fields;
  }

  return (
    <fieldset className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-5">
      <legend className="px-1 text-sm font-medium">Геопозиция</legend>
      {fields}
    </fieldset>
  );
}
