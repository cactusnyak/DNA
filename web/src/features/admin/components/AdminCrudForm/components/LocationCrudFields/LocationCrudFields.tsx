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
    <>
      <FormInputField
        name="locationName"
        label="Геопозиция"
        caption="Оставьте геопозицию и координаты пустыми, если они не нужны."
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
}
