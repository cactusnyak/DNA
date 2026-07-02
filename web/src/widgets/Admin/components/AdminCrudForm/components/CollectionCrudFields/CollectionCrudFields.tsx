import {
  FormInputField,
  FormTextareaField,
} from '@/components/ui/FormField';

import { SELECT_CLASS_NAME } from '../../data/select-class-name';
import type { AdminCrudFieldsProps } from '../../types/admin-crud-form';

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

      <label className="flex flex-col">
        <span className="text-sm font-medium">Тип подборки</span>

        <select
          value={String(values.type ?? 'CATEGORY')}
          className={SELECT_CLASS_NAME}
          onChange={(event) => onValueChange('type', event.target.value)}
        >
          <option value="CATEGORY">Категории</option>
          <option value="PRODUCT">Продукты</option>
        </select>
      </label>

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
