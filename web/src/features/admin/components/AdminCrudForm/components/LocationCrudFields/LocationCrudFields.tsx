import { FormInputField } from '@/components/ui/FormField';

import type {
  AdminCrudFormValues,
  AdminCrudUpdateValue,
} from '../../types/admin-crud-form';

type LocationCrudFieldsProps = {
  values: AdminCrudFormValues;
  onValueChange: AdminCrudUpdateValue;
};

export function LocationCrudFields({
  values,
  onValueChange,
}: LocationCrudFieldsProps) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-2xl border border-primary/12 bg-card p-5">
      <legend className="px-1 text-sm font-medium">Геопозиция</legend>

      <FormInputField
        name="locationName"
        label="Название точки"
        caption="Оставьте весь блок пустым, если геопозиция не нужна."
        placeholder="Например, Талдом"
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
          placeholder="56.7308"
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
          placeholder="37.5276"
          value={String(values.locationLongitude ?? '')}
          onChange={(event) =>
            onValueChange('locationLongitude', event.target.value)
          }
        />
      </div>
    </fieldset>
  );
}
