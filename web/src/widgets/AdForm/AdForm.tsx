import { type FormEvent, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  FormImageFilesField,
  FormInputField,
  FormSelectField,
  FormTextareaField,
} from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import type { Ad, CreateAdPayload } from '@/entities/ad';
import { getAdCategories } from '@/entities/ad-category';

type AdFormProps = {
  initialAd?: Ad;
  isPending?: boolean;
  submitLabel: string;
  onUploadImage: (file: File) => Promise<string>;
  onSubmit: (payload: CreateAdPayload) => void | Promise<void>;
  onCancel?: () => void;
};

export function AdForm({
  initialAd,
  isPending = false,
  submitLabel,
  onUploadImage,
  onSubmit,
  onCancel,
}: AdFormProps) {
  const { data: categories = [] } = useQuery({
    queryKey: ['ad-categories'],
    queryFn: getAdCategories,
  });

  const [title, setTitle] = useState(initialAd?.title ?? '');
  const [categoryId, setCategoryId] = useState(initialAd?.categoryId ?? '');
  const [price, setPrice] = useState(String(initialAd?.price ?? ''));
  const [description, setDescription] = useState(initialAd?.description ?? '');
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(
    initialAd?.images.map((image) => image.url) ?? [],
  );
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [error, setError] = useState<string>();

  const categoryOptions = useMemo(
    () => [
      { value: '', label: 'Выберите категорию', disabled: true },
      ...categories.map((category) => ({
        value: category.id,
        label: category.name,
      })),
    ],
    [categories],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);

    if (!title.trim()) {
      setError('Укажите заголовок объявления.');
      return;
    }

    if (!categoryId) {
      setError('Выберите категорию объявления.');
      return;
    }

    setIsUploadingImages(true);

    try {
      const uploadedImageUrls = await Promise.all(
        imageFiles.map(onUploadImage),
      );

      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        categoryId,
        price: Number(price) || 0,
        imageUrls: [...existingImageUrls, ...uploadedImageUrls],
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Не удалось сохранить объявление.',
      );
    } finally {
      setIsUploadingImages(false);
    }
  }

  const isFormPending = isPending || isUploadingImages;

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <FormInputField
        required
        label="Заголовок"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />

      <FormSelectField
        required
        label="Категория"
        value={categoryId}
        options={categoryOptions}
        onValueChange={setCategoryId}
      />

      <FormInputField
        required
        type="number"
        label="Цена, ₽"
        value={price}
        onChange={(event) => setPrice(event.target.value)}
      />

      <FormTextareaField
        label="Описание"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />

      <FormImageFilesField
        label="Изображения"
        caption="Можно выбрать несколько файлов. Новые файлы будут загружены при сохранении."
        files={imageFiles}
        existingImageUrls={existingImageUrls}
        disabled={isFormPending}
        onFilesChange={setImageFiles}
        onExistingImageUrlsChange={setExistingImageUrls}
      />

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isFormPending}>
          {isUploadingImages ? 'Загружаем изображения...' : isPending ? 'Сохраняем...' : submitLabel}
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="outline"
            disabled={isFormPending}
            onClick={onCancel}
          >
            Отмена
          </Button>
        )}
      </div>
    </form>
  );
}
