import {
  FormImageFilesField,
  FormInputField,
  FormSelectField,
  FormTextareaField,
} from '@/components/ui/FormField';

import type { AdminCrudFieldsProps } from '../../types/admin-crud-form';
import type { ProductAddition } from '@/entities/product';
import { ProductAdditionsFields } from '../ProductAdditionsFields';
import { LocationCrudFields } from '../LocationCrudFields';

function getStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function getFileArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is File => item instanceof File)
    : [];
}

export function ProductCrudFields({
  values,
  categories,
  onValueChange,
}: AdminCrudFieldsProps) {
  const categoryOptions = [
    {
      value: '',
      label: 'Выберите категорию',
      disabled: true,
    },
    ...categories.map((category) => ({
      value: category.id,
      label: category.name,
    })),
  ];

  const existingImageUrls = getStringArray(values.imageUrls);
  const imageFiles = getFileArray(values.imageFiles);

  return (
    <div className="flex flex-col gap-5">
      <FormInputField
        name="title"
        required
        label="Название"
        value={String(values.title ?? '')}
        onChange={(event) => onValueChange('title', event.target.value)}
      />

      <FormInputField
        name="slug"
        label="Slug"
        caption="Можно оставить пустым, система создаст сама."
        value={String(values.slug ?? '')}
        onChange={(event) => onValueChange('slug', event.target.value)}
      />

      <FormSelectField
        required
        label="Категория"
        value={String(values.categoryId ?? '')}
        options={categoryOptions}
        onValueChange={(value) => onValueChange('categoryId', value)}
      />

      <FormSelectField label="Крупногабаритность" caption={`При наследовании сейчас: ${categories.find((category) => category.id === values.categoryId)?.isOversized ? 'крупногабаритный' : 'обычный товар'}`} value={String(values.isOversizedOverride ?? 'inherit')} options={[{ value: 'inherit', label: 'Наследовать от категории' }, { value: 'oversized', label: 'Крупногабаритный' }, { value: 'regular', label: 'Обычный товар' }]} onValueChange={(value) => onValueChange('isOversizedOverride', value)} />

      <FormInputField
        name="price"
        required
        type="number"
        label="Цена"
        value={String(values.price ?? '')}
        onChange={(event) => onValueChange('price', event.target.value)}
      />

      <FormTextareaField
        name="description"
        label="Описание"
        caption="Каждая строка — отдельный блок. Начните строку с «# », чтобы создать заголовок."
        rows={8}
        value={String(values.description ?? '')}
        onChange={(event) => onValueChange('description', event.target.value)}
      />

      <LocationCrudFields
        plain
        values={values}
        onValueChange={onValueChange}
      />

      <FormImageFilesField
        name="images"
        label="Изображения"
        caption="Новые файлы будут загружены на сервер, а в товар сохранятся полученные URL."
        files={imageFiles}
        existingImageUrls={existingImageUrls}
        onFilesChange={(files) => onValueChange('imageFiles', files)}
        onExistingImageUrlsChange={(imageUrls) =>
          onValueChange('imageUrls', imageUrls)
        }
      />

      <ProductAdditionsFields
        value={
          Array.isArray(values.additions)
            ? (values.additions as ProductAddition[])
            : []
        }
        onChange={(additions) => onValueChange('additions', additions)}
      />
    </div>
  );
}
