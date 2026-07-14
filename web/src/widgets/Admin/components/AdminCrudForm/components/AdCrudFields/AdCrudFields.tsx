import {
  FormImageFilesField,
  FormInputField,
  FormSelectField,
  FormTextareaField,
} from '@/components/ui/FormField';
import { AD_STATUS_LABELS } from '@/entities/ad';

import type { AdminCrudFieldsProps } from '../../types/admin-crud-form';

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

const adStatusOptions = (
  Object.keys(AD_STATUS_LABELS) as (keyof typeof AD_STATUS_LABELS)[]
).map((status) => ({
  value: status,
  label: AD_STATUS_LABELS[status],
}));

export function AdCrudFields({
  values,
  adCategories,
  onValueChange,
}: AdminCrudFieldsProps) {
  const categoryOptions = [
    {
      value: '',
      label: 'Выберите категорию',
      disabled: true,
    },
    ...adCategories.map((category) => ({
      value: category.id,
      label: category.name,
    })),
  ];

  const existingImageUrls = getStringArray(values.imageUrls);
  const imageFiles = getFileArray(values.imageFiles);

  return (
    <div className="flex flex-col gap-5">
      <FormInputField
        required
        label="Заголовок"
        value={String(values.title ?? '')}
        onChange={(event) => onValueChange('title', event.target.value)}
      />

      <FormInputField
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

      <FormSelectField
        label="Статус модерации"
        value={String(values.status ?? 'PUBLISHED')}
        options={adStatusOptions}
        onValueChange={(value) => onValueChange('status', value)}
      />

      <FormInputField
        required
        type="number"
        label="Цена"
        value={String(values.price ?? '')}
        onChange={(event) => onValueChange('price', event.target.value)}
      />

      <FormTextareaField
        label="Описание"
        value={String(values.description ?? '')}
        onChange={(event) => onValueChange('description', event.target.value)}
      />

      <FormImageFilesField
        label="Изображения"
        caption="Новые файлы будут загружены на сервер, а в объявление сохранятся полученные URL."
        files={imageFiles}
        existingImageUrls={existingImageUrls}
        onFilesChange={(files) => onValueChange('imageFiles', files)}
        onExistingImageUrlsChange={(imageUrls) =>
          onValueChange('imageUrls', imageUrls)
        }
      />

      <FormInputField
        label="Телефон"
        type="tel"
        value={String(values.contactPhone ?? '')}
        onChange={(event) => onValueChange('contactPhone', event.target.value)}
      />

      <FormInputField
        label="Telegram"
        placeholder="@username"
        value={String(values.contactTelegram ?? '')}
        onChange={(event) => onValueChange('contactTelegram', event.target.value)}
      />

      <FormInputField
        label="Email (объявления)"
        type="email"
        value={String(values.contactEmail ?? '')}
        onChange={(event) => onValueChange('contactEmail', event.target.value)}
      />

      <FormInputField
        label="Другой контакт"
        value={String(values.contactOther ?? '')}
        onChange={(event) => onValueChange('contactOther', event.target.value)}
      />
    </div>
  );
}
