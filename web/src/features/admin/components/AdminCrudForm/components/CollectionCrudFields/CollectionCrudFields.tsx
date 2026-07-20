import {
  FormInputField,
  FormSelectField,
  FormTextareaField,
} from '@/components/ui/FormField';

import type { AdminCrudFieldsProps } from '../../types/admin-crud-form';

const collectionTypeOptions = [
  {
    value: 'CATEGORY',
    label: 'Категории',
  },
  {
    value: 'PRODUCT',
    label: 'Продукты',
  },
];

export function CollectionCrudFields({
  values,
  onValueChange,
}: AdminCrudFieldsProps) {
  return (
    <div className="flex flex-col gap-5">
      <FormInputField
        required
        label="Название"
        value={String(values.title ?? '')}
        onChange={(event) => onValueChange('title', event.target.value)}
      />

      <FormInputField
        label="Slug"
        caption="Например: popular-products."
        value={String(values.slug ?? '')}
        onChange={(event) => onValueChange('slug', event.target.value)}
      />

      <FormSelectField
        label="Тип подборки"
        value={String(values.type ?? 'CATEGORY')}
        options={collectionTypeOptions}
        onValueChange={(value) => onValueChange('type', value)}
      />

      <FormTextareaField
        label="Описание"
        value={String(values.description ?? '')}
        onChange={(event) => onValueChange('description', event.target.value)}
      />
    </div>
  );
}
