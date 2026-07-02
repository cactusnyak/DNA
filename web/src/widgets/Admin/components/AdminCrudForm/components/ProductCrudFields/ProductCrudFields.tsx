import {
  FormInputField,
  FormTextareaField,
} from '@/components/ui/FormField';

import { SELECT_CLASS_NAME } from '../../data/select-class-name';
import type { AdminCrudFieldsProps } from '../../types/admin-crud-form';

export function ProductCrudFields({
  values,
  categories,
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
        caption="Можно оставить пустым, система создаст сама."
        value={String(values.slug ?? '')}
        onChange={(event) => onValueChange('slug', event.target.value)}
      />

      <label className="flex flex-col">
        <span className="text-sm font-medium after:ml-1 after:text-destructive after:content-['*']">
          Категория
        </span>

        <select
          required
          value={String(values.categoryId ?? '')}
          className={SELECT_CLASS_NAME}
          onChange={(event) => onValueChange('categoryId', event.target.value)}
        >
          <option value="">Выберите категорию</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <FormInputField
        required
        type="number"
        label="Цена"
        value={String(values.price ?? '')}
        onChange={(event) => onValueChange('price', event.target.value)}
      />

      <div className="md:col-span-2">
        <FormTextareaField
          label="Описание"
          value={String(values.description ?? '')}
          onChange={(event) => onValueChange('description', event.target.value)}
        />
      </div>

      <div className="md:col-span-2">
        <FormTextareaField
          label="Изображения"
          caption="Каждый URL с новой строки."
          value={String(values.imageUrls ?? '')}
          onChange={(event) => onValueChange('imageUrls', event.target.value)}
        />
      </div>
    </div>
  );
}
