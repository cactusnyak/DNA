import {
  type ChangeEvent,
  type ComponentProps,
  type HTMLInputTypeAttribute,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import {
  Check,
  ChevronDown,
  ImagePlus,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';

import { cn } from '@/shared/utils/cn';

import { Input } from './Input';

type FormFieldBaseProps = {
  label: ReactNode;
  caption?: ReactNode;
  required?: boolean;
  className?: string;
};

type FormFieldRootProps = FormFieldBaseProps & {
  children: ReactNode;
};

type FormInputFieldProps = FormFieldBaseProps & {
  value: string;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  disabled?: boolean;
  minLength?: number;
  autoComplete?: ComponentProps<'input'>['autoComplete'];
  inputClassName?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

type FormTextareaFieldProps = FormFieldBaseProps & {
  value: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  textareaClassName?: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
};

export type FormSelectOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

type FormSelectFieldProps = FormFieldBaseProps & {
  value: string;
  options: FormSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  selectClassName?: string;
  dropdownClassName?: string;
  onValueChange: (value: string) => void;
};

type FormToggleFieldProps = FormFieldBaseProps & {
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
};

type FormImageFileFieldProps = FormFieldBaseProps & {
  file?: File | null;
  previewUrl?: string;
  accept?: string;
  disabled?: boolean;
  onFileChange: (file: File | null) => void;
  onPreviewUrlClear?: () => void;
};

type FormImageFilesFieldProps = FormFieldBaseProps & {
  files: File[];
  existingImageUrls?: string[];
  accept?: string;
  disabled?: boolean;
  onFilesChange: (files: File[]) => void;
  onExistingImageUrlsChange?: (imageUrls: string[]) => void;
};

const TEXTAREA_CLASS_NAME =
  'w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm leading-5 outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50';

const SELECT_TRIGGER_CLASS_NAME =
  'flex h-10 w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-left text-sm outline-none transition-colors hover:border-ring focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50';

const FILE_DROPZONE_CLASS_NAME =
  'flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-4 py-5 text-center transition-colors hover:border-ring hover:bg-muted/50';

function FormFieldRoot({
  label,
  caption,
  required = false,
  className,
  children,
}: FormFieldRootProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      <span
        className={cn(
          'mb-2 ml-0.5 text-sm font-medium',
          required &&
          "after:ml-1 after:text-destructive after:content-['*']",
        )}
      >
        {label}
      </span>

      {children}

      {caption && (
        <span className="mt-1 ml-0.5 text-xs leading-5 text-muted-foreground">
          {caption}
        </span>
      )}
    </div>
  );
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} КБ`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} МБ`;
}

export function FormInputField({
  label,
  caption,
  required = false,
  value,
  placeholder,
  type = 'text',
  disabled = false,
  minLength,
  autoComplete = 'off',
  className,
  inputClassName,
  onChange,
}: FormInputFieldProps) {
  return (
    <FormFieldRoot
      label={label}
      caption={caption}
      required={required}
      className={className}
    >
      <Input
        required={required}
        disabled={disabled}
        type={type}
        value={value}
        minLength={minLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={inputClassName}
        onChange={onChange}
      />
    </FormFieldRoot>
  );
}

export function FormTextareaField({
  label,
  caption,
  required = false,
  value,
  placeholder,
  rows = 4,
  disabled = false,
  className,
  textareaClassName,
  onChange,
}: FormTextareaFieldProps) {
  return (
    <FormFieldRoot
      label={label}
      caption={caption}
      required={required}
      className={className}
    >
      <textarea
        required={required}
        value={value}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        className={cn(TEXTAREA_CLASS_NAME, textareaClassName)}
        onChange={onChange}
      />
    </FormFieldRoot>
  );
}

export function FormSelectField({
  label,
  caption,
  required = false,
  value,
  options,
  placeholder = 'Выберите значение',
  disabled = false,
  className,
  selectClassName,
  dropdownClassName,
  onValueChange,
}: FormSelectFieldProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleDocumentMouseDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleDocumentMouseDown);

    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown);
    };
  }, [isOpen]);

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'Escape') {
      setIsOpen(false);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen((currentValue) => !currentValue);
    }
  }

  function handleOptionClick(option: FormSelectOption) {
    if (option.disabled) {
      return;
    }

    onValueChange(option.value);
    setIsOpen(false);
  }

  return (
    <FormFieldRoot
      label={label}
      caption={caption}
      required={required}
      className={className}
    >
      <div ref={rootRef} className="relative">
        <button
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-required={required}
          className={cn(SELECT_TRIGGER_CLASS_NAME, selectClassName)}
          onClick={() => setIsOpen((currentValue) => !currentValue)}
          onKeyDown={handleTriggerKeyDown}
        >
          <span
            className={cn(
              'truncate',
              !selectedOption && 'text-muted-foreground',
            )}
          >
            {selectedOption?.label ?? placeholder}
          </span>

          <ChevronDown
            className={cn(
              'size-4 shrink-0 text-muted-foreground transition-transform',
              isOpen && 'rotate-180',
            )}
            strokeWidth={1.5}
          />
        </button>

        {isOpen && (
          <div
            id={listboxId}
            role="listbox"
            className={cn(
              'absolute left-0 right-0 top-full z-30 mt-2 max-h-64 overflow-y-auto rounded-lg border border-border bg-popover p-1 text-sm shadow-lg',
              dropdownClassName,
            )}
          >
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  className={cn(
                    'flex w-full cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-left transition-colors',
                    'hover:bg-muted hover:text-foreground',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    isSelected && 'bg-muted text-foreground',
                  )}
                  onClick={() => handleOptionClick(option)}
                >
                  <span className="truncate">{option.label}</span>

                  {isSelected && (
                    <Check className="size-4 shrink-0" strokeWidth={1.5} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </FormFieldRoot>
  );
}

export function FormToggleField({
  label,
  caption,
  required = false,
  checked,
  disabled = false,
  className,
  onCheckedChange,
}: FormToggleFieldProps) {
  return (
    <FormFieldRoot
      label={label}
      caption={caption}
      required={required}
      className={className}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={cn(
          'flex w-full cursor-pointer items-center justify-between gap-4 rounded-lg border border-border bg-background px-3 py-2 text-left text-sm transition-colors',
          'hover:border-ring',
          'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
        onClick={() => onCheckedChange(!checked)}
      >
        <span className="text-muted-foreground">
          {checked ? 'Включено' : 'Выключено'}
        </span>

        <span
          className={cn(
            'flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors',
            checked ? 'bg-primary' : 'bg-muted',
          )}
        >
          <span
            className={cn(
              'size-5 rounded-full bg-background shadow-sm transition-transform',
              checked && 'translate-x-5',
            )}
          />
        </span>
      </button>
    </FormFieldRoot>
  );
}

export function FormImageFileField({
  label,
  caption,
  required = false,
  file,
  previewUrl,
  accept = 'image/*',
  disabled = false,
  className,
  onFileChange,
  onPreviewUrlClear,
}: FormImageFileFieldProps) {
  const inputId = useId();
  const [filePreviewUrl, setFilePreviewUrl] = useState<string>();

  useEffect(() => {
    if (!file) {
      setFilePreviewUrl(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setFilePreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const activePreviewUrl = filePreviewUrl ?? previewUrl;
  const hasPreview = Boolean(activePreviewUrl);

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    onFileChange(event.target.files?.[0] ?? null);
    event.target.value = '';
  }

  function handleClear() {
    onFileChange(null);

    if (!file && previewUrl) {
      onPreviewUrlClear?.();
    }
  }

  return (
    <FormFieldRoot
      label={label}
      caption={caption}
      required={required}
      className={className}
    >
      <div className="space-y-3">
        {hasPreview && (
          <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
            <div className="relative aspect-video bg-muted">
              <img
                src={activePreviewUrl}
                alt="Предпросмотр изображения"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-3 py-2">
              <div className="min-w-0 text-xs text-muted-foreground">
                {file ? (
                  <>
                    <span className="block truncate font-medium text-foreground">
                      {file.name}
                    </span>
                    <span>{formatFileSize(file.size)}</span>
                  </>
                ) : (
                  <span className="block truncate">Текущее изображение</span>
                )}
              </div>

              <button
                type="button"
                disabled={disabled}
                className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleClear}
              >
                <Trash2 className="size-3.5" strokeWidth={1.5} />
                Удалить
              </button>
            </div>
          </div>
        )}

        <label
          htmlFor={inputId}
          className={cn(
            FILE_DROPZONE_CLASS_NAME,
            disabled && 'pointer-events-none cursor-not-allowed opacity-50',
          )}
        >
          <input
            id={inputId}
            type="file"
            accept={accept}
            disabled={disabled}
            className="sr-only"
            onChange={handleInputChange}
          />

          <span className="mb-3 inline-flex size-10 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm">
            {hasPreview ? (
              <ImagePlus className="size-5" strokeWidth={1.5} />
            ) : (
              <UploadCloud className="size-5" strokeWidth={1.5} />
            )}
          </span>

          <span className="text-sm font-medium text-foreground">
            {hasPreview ? 'Заменить изображение' : 'Выбрать изображение'}
          </span>

          <span className="mt-1 text-xs text-muted-foreground">
            PNG, JPG, WEBP, GIF или AVIF до 5 МБ
          </span>
        </label>
      </div>
    </FormFieldRoot>
  );
}

export function FormImageFilesField({
  label,
  caption,
  required = false,
  files,
  existingImageUrls = [],
  accept = 'image/*',
  disabled = false,
  className,
  onFilesChange,
  onExistingImageUrlsChange,
}: FormImageFilesFieldProps) {
  const inputId = useId();
  const [filePreviewUrls, setFilePreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    const objectUrls = files.map((file) => URL.createObjectURL(file));
    setFilePreviewUrls(objectUrls);

    return () => {
      objectUrls.forEach((objectUrl) => URL.revokeObjectURL(objectUrl));
    };
  }, [files]);

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length) {
      onFilesChange([...files, ...selectedFiles]);
    }

    event.target.value = '';
  }

  function removeExistingImage(index: number) {
    onExistingImageUrlsChange?.(
      existingImageUrls.filter((_, imageIndex) => imageIndex !== index),
    );
  }

  function removeFile(index: number) {
    onFilesChange(files.filter((_, fileIndex) => fileIndex !== index));
  }

  const hasImages = existingImageUrls.length > 0 || files.length > 0;

  return (
    <FormFieldRoot
      label={label}
      caption={caption}
      required={required}
      className={className}
    >
      <div className="space-y-3">
        {hasImages && (
          <div className="grid gap-3 sm:grid-cols-2">
            {existingImageUrls.map((imageUrl, index) => (
              <div
                key={`${imageUrl}-${index}`}
                className="overflow-hidden rounded-xl border border-border bg-muted/30"
              >
                <div className="relative aspect-video bg-muted">
                  <img
                    src={imageUrl}
                    alt="Изображение продукта"
                    className="h-full w-full object-cover"
                  />

                  <button
                    type="button"
                    disabled={disabled}
                    aria-label="Удалить изображение"
                    className="absolute right-2 top-2 inline-flex size-7 cursor-pointer items-center justify-center rounded-md bg-background/90 text-muted-foreground shadow-sm transition-colors hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => removeExistingImage(index)}
                  >
                    <X className="size-4" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
                  Текущее изображение #{index + 1}
                </div>
              </div>
            ))}

            {files.map((file, index) => (
              <div
                key={`${file.name}-${file.size}-${index}`}
                className="overflow-hidden rounded-xl border border-border bg-muted/30"
              >
                <div className="relative aspect-video bg-muted">
                  <img
                    src={filePreviewUrls[index]}
                    alt="Новое изображение продукта"
                    className="h-full w-full object-cover"
                  />

                  <button
                    type="button"
                    disabled={disabled}
                    aria-label="Удалить изображение"
                    className="absolute right-2 top-2 inline-flex size-7 cursor-pointer items-center justify-center rounded-md bg-background/90 text-muted-foreground shadow-sm transition-colors hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => removeFile(index)}
                  >
                    <X className="size-4" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
                  <span className="block truncate font-medium text-foreground">
                    {file.name}
                  </span>
                  <span>{formatFileSize(file.size)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <label
          htmlFor={inputId}
          className={cn(
            FILE_DROPZONE_CLASS_NAME,
            disabled && 'pointer-events-none cursor-not-allowed opacity-50',
          )}
        >
          <input
            id={inputId}
            type="file"
            accept={accept}
            multiple
            disabled={disabled}
            className="sr-only"
            onChange={handleInputChange}
          />

          <span className="mb-3 inline-flex size-10 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm">
            <UploadCloud className="size-5" strokeWidth={1.5} />
          </span>

          <span className="text-sm font-medium text-foreground">
            {hasImages ? 'Добавить изображения' : 'Выбрать изображения'}
          </span>

          <span className="mt-1 text-xs text-muted-foreground">
            Можно выбрать несколько файлов. PNG, JPG, WEBP, GIF или AVIF до 5 МБ
          </span>
        </label>
      </div>
    </FormFieldRoot>
  );
}
