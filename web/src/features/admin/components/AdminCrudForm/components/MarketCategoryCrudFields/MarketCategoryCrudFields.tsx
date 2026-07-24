import {
  FormImageFileField,
  FormInputField,
  FormSelectField,
  FormTextareaField,
} from '@/components/ui/FormField';
import type { AdminMarketCategory } from '@/entities/admin';

import type { AdminCrudFieldsProps } from '../../types/admin-crud-form';

export function MarketCategoryCrudFields({
  values,
  categories,
  record,
  onValueChange,
}: AdminCrudFieldsProps) {
  const categoryRecord = record as AdminMarketCategory | undefined;
  const imageFile = values.imageFile instanceof File ? values.imageFile : null;

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
        name="name"
        required
        label="Название"
        value={String(values.name ?? '')}
        onChange={(event) => onValueChange('name', event.target.value)}
      />

      <FormInputField
        name="slug"
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
        name="sortOrder"
        type="number"
        label="Порядок сортировки"
        value={String(values.sortOrder ?? '')}
        onChange={(event) => onValueChange('sortOrder', event.target.value)}
      />

      <FormImageFileField
        name="image"
        label="Изображение"
        caption="Файл будет загружен на сервер, а в каталог сохранится полученный URL."
        file={imageFile}
        previewUrl={String(values.imageUrl ?? '')}
        onFileChange={(file) => onValueChange('imageFile', file)}
        onPreviewUrlClear={() => onValueChange('imageUrl', '')}
      />

      <FormInputField
        name="imageAlt"
        label="Alt изображения"
        value={String(values.imageAlt ?? '')}
        onChange={(event) => onValueChange('imageAlt', event.target.value)}
      />

      <FormTextareaField
        name="description"
        label="Описание"
        value={String(values.description ?? '')}
        onChange={(event) => onValueChange('description', event.target.value)}
      />
    </div>
  );
}
