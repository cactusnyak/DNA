import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  FormImageFilesField,
  FormInputField,
  FormSelectField,
  FormTextareaField,
} from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import type { Ad, CreateAdPayload } from '@/entities/ad';
import { getCurrentUser } from '@/entities/auth';
import { getAdCategories } from '@/entities/ad-category';
import { LegalFormNotice } from '@/shared/legal/LegalFormNotice';
import {
  contentDescriptionToMarkdown,
  markdownToContentDescription,
} from '@/shared/utils/content-description';

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
  const [description, setDescription] = useState(
    contentDescriptionToMarkdown(initialAd?.description),
  );
  const [locationName, setLocationName] = useState(
    initialAd?.location?.name ?? '',
  );
  const [locationLatitude, setLocationLatitude] = useState(
    String(initialAd?.location?.coordinates.latitude ?? ''),
  );
  const [locationLongitude, setLocationLongitude] = useState(
    String(initialAd?.location?.coordinates.longitude ?? ''),
  );
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
  const [showPhone, setShowPhone] = useState(Boolean(initialAd?.contactPhone));
  const [showTelegram, setShowTelegram] = useState(
    Boolean(initialAd?.contactTelegram),
  );
  const [showEmail, setShowEmail] = useState(Boolean(initialAd?.contactEmail));
  const [showOther, setShowOther] = useState(Boolean(initialAd?.contactOther));
  const [publicationConsent, setPublicationConsent] = useState(false);

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
      (showPhone && contactPhone.trim()) ||
      (showTelegram && contactTelegram.trim()) ||
      (showEmail && contactEmail.trim()) ||
      (showOther && contactOther.trim());

    if (!hasContact) {
      setError('Укажите хотя бы один способ связи.');
      return;
    }

    if (!publicationConsent) {
      setError('Подтвердите согласие на публикацию выбранных контактов.');
      return;
    }

    const hasAnyLocationValue =
      locationName.trim() ||
      locationLatitude.trim() ||
      locationLongitude.trim();

    if (
      hasAnyLocationValue &&
      (!locationName.trim() ||
        !locationLatitude.trim() ||
        !locationLongitude.trim())
    ) {
      setError('Для геопозиции заполните название точки и обе координаты.');
      return;
    }

    const latitude = Number(locationLatitude);
    const longitude = Number(locationLongitude);

    if (
      hasAnyLocationValue &&
      (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)
    ) {
      setError('Широта должна быть числом от −90 до 90.');
      return;
    }

    if (
      hasAnyLocationValue &&
      (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)
    ) {
      setError('Долгота должна быть числом от −180 до 180.');
      return;
    }

    setIsUploadingImages(true);

    try {
      const uploadedImageUrls = await Promise.all(
        imageFiles.map(onUploadImage),
      );

      await onSubmit({
        title: title.trim(),
        description: markdownToContentDescription(description),
        categoryId,
        price: Number(price) || 0,
        location: hasAnyLocationValue
          ? {
              name: locationName.trim(),
              coordinates: { latitude, longitude },
            }
          : undefined,
        imageUrls: [...existingImageUrls, ...uploadedImageUrls],
        contactPhone: showPhone ? contactPhone.trim() || undefined : undefined,
        contactTelegram: showTelegram
          ? contactTelegram.trim() || undefined
          : undefined,
        contactEmail: showEmail ? contactEmail.trim() || undefined : undefined,
        contactOther: showOther ? contactOther.trim() || undefined : undefined,
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
        name="title"
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
        name="price"
        required
        type="number"
        label="Цена, ₽"
        value={price}
        onChange={(event) => setPrice(event.target.value)}
      />

      <FormTextareaField
        name="description"
        label="Описание"
        caption="Каждая строка — отдельный блок. Начните строку с «# », чтобы создать заголовок."
        rows={8}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />

<<<<<<< HEAD
      <fieldset className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-5">
=======
      <fieldset className="flex flex-col gap-4 rounded-2xl border border-primary/12 bg-card p-5">
>>>>>>> origin/main
        <legend className="px-1 text-sm font-medium">Геопозиция</legend>

        <FormInputField
          name="locationName"
          label="Название точки"
          caption="Оставьте весь блок пустым, если геопозиция не нужна."
          placeholder="Например, Талдом"
          value={locationName}
          onChange={(event) => setLocationName(event.target.value)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormInputField
            name="locationLatitude"
            type="number"
            inputMode="decimal"
            min={-90}
            max={90}
            step={0.000001}
            label="Широта"
            placeholder="56.7308"
            value={locationLatitude}
            onChange={(event) => setLocationLatitude(event.target.value)}
          />

          <FormInputField
            name="locationLongitude"
            type="number"
            inputMode="decimal"
            min={-180}
            max={180}
            step={0.000001}
            label="Долгота"
            placeholder="37.5276"
            value={locationLongitude}
            onChange={(event) => setLocationLongitude(event.target.value)}
          />
        </div>
      </fieldset>

      <FormImageFilesField
        name="images"
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

<<<<<<< HEAD
        <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-5">
=======
        <div className="flex flex-col gap-4 rounded-2xl border border-primary/12 bg-card p-5">
>>>>>>> origin/main
          <FormInputField
            name="contactPhone"
            label="Телефон"
            type="tel"
            value={contactPhone}
            onChange={(event) => setContactPhone(event.target.value)}
          />
          <ContactVisibility
            checked={showPhone}
            disabled={!contactPhone.trim()}
            label="Показывать телефон"
            onChange={setShowPhone}
          />

          <FormInputField
            name="contactTelegram"
            label="Telegram"
            placeholder="@username"
            value={contactTelegram}
            onChange={(event) => setContactTelegram(event.target.value)}
          />
          <ContactVisibility
            checked={showTelegram}
            disabled={!contactTelegram.trim()}
            label="Показывать Telegram"
            onChange={setShowTelegram}
          />

          <FormInputField
            name="contactEmail"
            label="Email"
            type="email"
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value)}
          />
          <ContactVisibility
            checked={showEmail}
            disabled={!contactEmail.trim()}
            label="Показывать email"
            onChange={setShowEmail}
          />

          <FormInputField
            name="contactOther"
            label="Другой способ связи"
            placeholder="WhatsApp, ВКонтакте и т.д."
            value={contactOther}
            onChange={(event) => setContactOther(event.target.value)}
          />
          <ContactVisibility
            checked={showOther}
            disabled={!contactOther.trim()}
            label="Показывать другой способ связи"
            onChange={setShowOther}
          />
        </div>

        <p className="mt-1 ml-0.5 text-xs leading-5 text-muted-foreground">
          Укажите хотя бы один способ связи. Незаполненные поля не будут
          показаны покупателям.
        </p>
      </div>

<<<<<<< HEAD
      <label className="flex items-start gap-3 rounded-xl border border-border/80 bg-card p-4 text-sm leading-6">
=======
      <label className="flex items-start gap-3 rounded-xl border border-primary/12 bg-card p-4 text-sm leading-6">
>>>>>>> origin/main
        <input
          name="publicationConsent"
          required
          type="checkbox"
          checked={publicationConsent}
          className="mt-1 size-4"
          onChange={(event) => setPublicationConsent(event.target.checked)}
        />
        <LegalFormNotice kind="publication" />
      </label>

      <LegalFormNotice />

      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="accent" disabled={isFormPending}>
          {isUploadingImages
            ? 'Загружаем изображения...'
            : isPending
              ? 'Сохраняем...'
              : submitLabel}
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="secondary"
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

function ContactVisibility({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="-mt-2 flex items-center gap-2 text-xs text-muted-foreground">
      <input
        name="contactVisibility"
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}
