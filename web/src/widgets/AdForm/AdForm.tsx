import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  FormImageFilesField,
  FormInputField,
  FormSelectField,
  FormTextareaField,
} from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import type { Ad, CreateAdPayload } from '@/entities/ad';
import { getCurrentUser } from '@/entities/auth';
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

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000,
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

  const [contactPhone, setContactPhone] = useState(
    initialAd?.contactPhone ?? '',
  );
  const [contactTelegram, setContactTelegram] = useState(
    initialAd?.contactTelegram ?? '',
  );
  const [contactEmail, setContactEmail] = useState(
    initialAd?.contactEmail ?? '',
  );
  const [contactOther, setContactOther] = useState(
    initialAd?.contactOther ?? '',
  );

  useEffect(() => {
    if (!initialAd && currentUser) {
      if (currentUser.phone && !contactPhone) {
        setContactPhone(currentUser.phone);
      }
      if (currentUser.email && !contactEmail) {
        setContactEmail(currentUser.email);
      }
    }
  }, [currentUser]);

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

    const hasContact =
      contactPhone.trim() ||
      contactTelegram.trim() ||
      contactEmail.trim() ||
      contactOther.trim();

    if (!hasContact) {
      setError('Укажите хотя бы один способ связи.');
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
        contactPhone: contactPhone.trim() || undefined,
        contactTelegram: contactTelegram.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        contactOther: contactOther.trim() || undefined,
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

      <div className="flex flex-col">
        <span className="mb-2 ml-0.5 text-sm font-medium">Контакты</span>

        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
          <FormInputField
            label="Телефон"
            type="tel"
            value={contactPhone}
            onChange={(event) => setContactPhone(event.target.value)}
          />

          <FormInputField
            label="Telegram"
            placeholder="@username"
            value={contactTelegram}
            onChange={(event) => setContactTelegram(event.target.value)}
          />

          <FormInputField
            label="Email"
            type="email"
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value)}
          />

          <FormInputField
            label="Другой способ связи"
            placeholder="WhatsApp, ВКонтакте и т.д."
            value={contactOther}
            onChange={(event) => setContactOther(event.target.value)}
          />
        </div>

        <p className="mt-1 ml-0.5 text-xs leading-5 text-muted-foreground">
          Укажите хотя бы один способ связи. Незаполненные поля не будут показаны покупателям.
        </p>
      </div>

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
