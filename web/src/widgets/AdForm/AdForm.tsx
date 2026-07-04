import { type FormEvent, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
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
  onSubmit: (payload: CreateAdPayload) => void | Promise<void>;
  onCancel?: () => void;
};

function getInitialImageUrls(ad?: Ad) {
  return ad?.images.map((image) => image.url).join('\n') ?? '';
}

export function AdForm({
  initialAd,
  isPending = false,
  submitLabel,
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
  const [imageUrlsText, setImageUrlsText] = useState(
    getInitialImageUrls(initialAd),
  );
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

    const imageUrls = imageUrlsText
      .split('\n')
      .map((url) => url.trim())
      .filter(Boolean);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        categoryId,
        price: Number(price) || 0,
        imageUrls,
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Не удалось сохранить объявление.',
      );
    }
  }

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

      <FormTextareaField
        label="Ссылки на изображения"
        caption="По одной ссылке в строке."
        value={imageUrlsText}
        onChange={(event) => setImageUrlsText(event.target.value)}
      />

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Сохраняем...' : submitLabel}
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={onCancel}
          >
            Отмена
          </Button>
        )}
      </div>
    </form>
  );
}
