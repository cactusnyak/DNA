import {
  FormInputField,
  FormSelectField,
  FormTextareaField,
} from '@/components/ui/FormField';
import type { AdminCategory } from '@/entities/admin';

import type { AdminCrudFieldsProps } from '../../types/admin-crud-form';

export function CategoryCrudFields({
  values,
  categories,
  record,
  onValueChange,
}: AdminCrudFieldsProps) {
  const categoryRecord = record as AdminCategory | undefined;

  const parentCategoryOptions = [
    {
      value: '',
      label: 'Без родителя',
    },
    ...categories
      .filter((category) => category.id !== categoryRecord?.id)
      .map((category) => ({
        value: category.id,
        label: category.name,
      })),
  ];

  return (
    <div className="flex flex-col gap-5">
      <FormInputField
        required
        label="Название"
        value={String(values.name ?? '')}
        onChange={(event) => onValueChange('name', event.target.value)}
      />

      <FormInputField
        label="Slug"
        caption="Можно оставить пустым, система создаст сама."
        value={String(values.slug ?? '')}
        onChange={(event) => onValueChange('slug', event.target.value)}
      />

      <FormSelectField
        label="Родительская категория"
        value={String(values.parentId ?? '')}
        options={parentCategoryOptions}
        onValueChange={(value) => onValueChange('parentId', value)}
      />

      <FormInputField
        type="number"
        label="Порядок сортировки"
        value={String(values.sortOrder ?? '')}
        onChange={(event) => onValueChange('sortOrder', event.target.value)}
      />

      <FormInputField
        label="URL изображения"
        value={String(values.imageUrl ?? '')}
        onChange={(event) => onValueChange('imageUrl', event.target.value)}
      />

      <FormInputField
        label="Alt изображения"
        value={String(values.imageAlt ?? '')}
        onChange={(event) => onValueChange('imageAlt', event.target.value)}
      />

      <FormTextareaField
        label="Описание"
        value={String(values.description ?? '')}
        onChange={(event) => onValueChange('description', event.target.value)}
      />
    </div>
  );
}