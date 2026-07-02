import {
  FormInputField,
  FormTextareaField,
} from '@/components/ui/FormField';
import type { AdminCategory } from '@/entities/admin';

import { SELECT_CLASS_NAME } from '../../data/select-class-name';
import type { AdminCrudFieldsProps } from '../../types/admin-crud-form';

export function CategoryCrudFields({
  values,
  categories,
  record,
  onValueChange,
}: AdminCrudFieldsProps) {
  const categoryRecord = record as AdminCategory | undefined;

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

      <label className="flex flex-col">
        <span className="text-sm font-medium">Родительская категория</span>

        <select
          value={String(values.parentId ?? '')}
          className={SELECT_CLASS_NAME}
          onChange={(event) => onValueChange('parentId', event.target.value)}
        >
          <option value="">Без родителя</option>

          {categories
            .filter((category) => category.id !== categoryRecord?.id)
            .map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
        </select>
      </label>

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

      <div className="md:col-span-2">
        <FormTextareaField
          label="Описание"
          value={String(values.description ?? '')}
          onChange={(event) => onValueChange('description', event.target.value)}
        />
      </div>
    </div>
  );
}
