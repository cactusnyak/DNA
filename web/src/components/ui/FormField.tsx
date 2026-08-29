import {
  type ChangeEvent,
  type ComponentProps,
  type HTMLInputTypeAttribute,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
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
  name: string;
  value: string;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  inputMode?: ComponentProps<'input'>['inputMode'];
  disabled?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  step?: number;
  autoComplete?: ComponentProps<'input'>['autoComplete'];
  inputClassName?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

type FormTextareaFieldProps = FormFieldBaseProps & {
  name: string;
  value: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  textareaClassName?: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
};

export type FormAddressSuggestion = {
  value: string;
  fullAddress: string;
};

type FormAddressFieldProps<TSuggestion extends FormAddressSuggestion> =
  FormFieldBaseProps & {
    name: string;
    value: string;
    placeholder?: string;
    disabled?: boolean;
    minQueryLength?: number;
    loadSuggestions: (query: string) => Promise<TSuggestion[]>;
    onValueChange: (value: string) => void;
    onSuggestionSelect: (suggestion: TSuggestion) => void;
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

type FormMultiSelectFieldProps = FormFieldBaseProps & {
  values: string[];
  options: FormSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  selectClassName?: string;
  dropdownClassName?: string;
  onValuesChange: (values: string[]) => void;
};

type FormToggleFieldProps = FormFieldBaseProps & {
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
};

type FormRadioFieldProps = {
  checked: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
  onCheckedChange: (checked: boolean) => void;
};

type FormNativeRadioFieldProps = FormRadioFieldProps & {
  name: string;
  value?: string;
};

type FormBooleanFieldProps = {
  label?: ReactNode;
  ariaLabel?: string;
  caption?: ReactNode;
  required?: boolean;
  checked: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
  variant?: 'checkbox' | 'radio-checkbox' | 'radio' | 'toggle';
  name?: string;
  value?: string;
  className?: string;
  onCheckedChange: (checked: boolean) => void;
};

type FormImageFileFieldProps = FormFieldBaseProps & {
  name: string;
  file?: File | null;
  previewUrl?: string;
  accept?: string;
  disabled?: boolean;
  onFileChange: (file: File | null) => void;
  onPreviewUrlClear?: () => void;
};

type FormImageFilesFieldProps = FormFieldBaseProps & {
  name: string;
  files: File[];
  existingImageUrls?: string[];
  accept?: string;
  disabled?: boolean;
  onFilesChange: (files: File[]) => void;
  onExistingImageUrlsChange?: (imageUrls: string[]) => void;
};

const TEXTAREA_CLASS_NAME =
  'w-full resize-none rounded-lg border border-border/80 bg-background px-3 py-2 text-sm leading-5 outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50';

const SELECT_TRIGGER_CLASS_NAME =
  'flex h-10 w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-border/80 bg-background px-3 py-2 text-left text-sm outline-none hover:border-ring focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50';

const FILE_DROPZONE_CLASS_NAME =
  'flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/30 px-4 py-5 text-center hover:border-ring hover:bg-muted/50';

function FormFieldRoot({
  label,
  caption,
  required = false,
  className,
  children,
}: FormFieldRootProps) {
  return (
    <div className={['flex flex-col', className].filter(Boolean).join(' ')}>
      <span
        className={[
          'mb-2 ml-0.5 text-sm font-medium',
          required &&
          "after:ml-1 after:text-destructive after:content-['*']",
        ].filter(Boolean).join(' ')}
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

function ObjectUrlImage({
  file,
  ...imageProps
}: { file: File } & Omit<ComponentProps<'img'>, 'src'>) {
  const [objectUrl] = useState(() => URL.createObjectURL(file));

  useEffect(
    () => () => {
      URL.revokeObjectURL(objectUrl);
    },
    [objectUrl],
  );

  return <img {...imageProps} src={objectUrl} />;
}

export function FormInputField({
  name,
  label,
  caption,
  required = false,
  value,
  placeholder,
  type = 'text',
  inputMode,
  disabled = false,
  minLength,
  maxLength,
  pattern,
  min,
  max,
  step,
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
        name={name}
        required={required}
        disabled={disabled}
        type={type}
        inputMode={inputMode}
        value={value}
        minLength={minLength}
        maxLength={maxLength}
        pattern={pattern}
        min={min}
        max={max}
        step={step}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={inputClassName}
        onChange={onChange}
      />
    </FormFieldRoot>
  );
}

export function FormAddressField<TSuggestion extends FormAddressSuggestion>({
  name,
  label,
  caption,
  required = false,
  value,
  placeholder,
  disabled = false,
  minQueryLength = 3,
  className,
  loadSuggestions,
  onValueChange,
  onSuggestionSelect,
}: FormAddressFieldProps<TSuggestion>) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);
  const skipNextRequestRef = useRef(false);
  const [suggestions, setSuggestions] = useState<TSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const close = useCallback(() => setIsOpen(false), []);
  const query = value.trim();
  const canLoadSuggestions = isFocused && query.length >= minQueryLength;
  const isSuggestionsOpen = canLoadSuggestions && isOpen;

  useEffect(() => {
    const requestId = ++requestIdRef.current;

    if (!canLoadSuggestions) return;

    if (skipNextRequestRef.current) {
      skipNextRequestRef.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      setIsLoading(true);
      void loadSuggestions(query)
        .then((nextSuggestions) => {
          if (requestId !== requestIdRef.current) return;
          setSuggestions(nextSuggestions);
          setIsOpen(nextSuggestions.length > 0);
        })
        .catch(() => {
          if (requestId !== requestIdRef.current) return;
          setSuggestions([]);
          close();
        })
        .finally(() => {
          if (requestId === requestIdRef.current) setIsLoading(false);
        });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [canLoadSuggestions, close, loadSuggestions, query]);

  useEffect(() => {
    function handleDocumentMouseDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) close();
    }
    document.addEventListener('mousedown', handleDocumentMouseDown);
    return () => document.removeEventListener('mousedown', handleDocumentMouseDown);
  }, [close]);

  return (
    <FormFieldRoot
      label={label}
      caption={caption}
      required={required}
      className={className}
    >
      <div
        ref={rootRef}
        className="relative"
        onFocusCapture={() => setIsFocused(true)}
        onBlurCapture={(event) => {
          if (event.currentTarget.contains(event.relatedTarget)) return;
          setIsFocused(false);
          close();
        }}
      >
        <Input
          name={name}
          required={required}
          disabled={disabled}
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={isSuggestionsOpen}
          onChange={(event) => {
            requestIdRef.current += 1;
            setSuggestions([]);
            setIsLoading(false);
            close();
            onValueChange(event.target.value);
          }}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          onKeyDown={(event) => event.key === 'Escape' && close()}
        />
        {isSuggestionsOpen && (
          <div
            id={listboxId}
            role="listbox"
            className="absolute left-0 right-0 top-full z-30 mt-2 flex max-h-72 flex-col gap-1 overflow-y-auto rounded-lg border border-border/80 bg-popover p-1 text-sm shadow-lg"
          >
            {suggestions.map((suggestion) => (
              <button
                key={`${suggestion.fullAddress}:${suggestion.value}`}
                type="button"
                role="option"
                aria-selected={false}
                className="cursor-pointer rounded-md px-3 py-2 text-left hover:bg-muted"
                onClick={() => {
                  skipNextRequestRef.current = true;
                  requestIdRef.current += 1;
                  setSuggestions([]);
                  setIsLoading(false);
                  onSuggestionSelect(suggestion);
                  close();
                }}
              >
                {suggestion.value}
              </button>
            ))}
          </div>
        )}
        {canLoadSuggestions && isLoading && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
            Ищем…
          </span>
        )}
      </div>
    </FormFieldRoot>
  );
}

export function FormTextareaField({
  name,
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
        name={name}
        required={required}
        value={value}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        className={[TEXTAREA_CLASS_NAME, textareaClassName].filter(Boolean).join(' ')}
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
  const dropdownOptions = options.filter((option) => option.value !== '');

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

    const shouldClearSelection = option.value === value && value !== '';

    onValueChange(shouldClearSelection ? '' : option.value);
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
          className={[SELECT_TRIGGER_CLASS_NAME, selectClassName].filter(Boolean).join(' ')}
          onClick={() => setIsOpen((currentValue) => !currentValue)}
          onKeyDown={handleTriggerKeyDown}
        >
          <span
            className={[
              'truncate',
              !selectedOption && 'text-muted-foreground',
            ].filter(Boolean).join(' ')}
          >
            {selectedOption?.label ?? placeholder}
          </span>

          <ChevronDown
            className={[
              'size-4 shrink-0 text-muted-foreground',
              isOpen && 'rotate-180',
            ].filter(Boolean).join(' ')}
            strokeWidth={1.5}
          />
        </button>

        {isOpen && (
          <div
            id={listboxId}
            role="listbox"
            className={[
              'absolute left-0 right-0 top-full z-30 mt-2 flex max-h-64 flex-col gap-1 overflow-y-auto rounded-lg border border-border/80 bg-popover p-1 text-sm shadow-lg',
              dropdownClassName,
            ].filter(Boolean).join(' ')}
          >
            {dropdownOptions.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  className={[
                    'flex w-full cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-left',
                    'hover:bg-muted hover:text-foreground',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    isSelected && 'bg-muted text-foreground',
                  ].filter(Boolean).join(' ')}
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

export function FormMultiSelectField({
  label,
  caption,
  required = false,
  values,
  options,
  placeholder = 'Выберите значения',
  disabled = false,
  className,
  selectClassName,
  dropdownClassName,
  onValuesChange,
}: FormMultiSelectFieldProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const selectedOptions = options.filter((option) => values.includes(option.value));

  useEffect(() => {
    if (!isOpen) return;

    function handleDocumentMouseDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    document.addEventListener('mousedown', handleDocumentMouseDown);
    return () => document.removeEventListener('mousedown', handleDocumentMouseDown);
  }, [isOpen]);

  function toggleOption(option: FormSelectOption) {
    if (option.disabled) return;
    onValuesChange(
      values.includes(option.value)
        ? values.filter((value) => value !== option.value)
        : [...values, option.value],
    );
  }

  return (
    <FormFieldRoot label={label} caption={caption} required={required} className={className}>
      <div ref={rootRef} className="relative">
        <button
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-required={required}
          className={[SELECT_TRIGGER_CLASS_NAME, selectClassName].filter(Boolean).join(' ')}
          onClick={() => setIsOpen((currentValue) => !currentValue)}
        >
          <span className={['truncate', !selectedOptions.length && 'text-muted-foreground'].filter(Boolean).join(' ')}>
            {selectedOptions.length
              ? selectedOptions.map((option) => option.label).join(', ')
              : placeholder}
          </span>
          <ChevronDown className={['size-4 shrink-0 text-muted-foreground', isOpen && 'rotate-180'].filter(Boolean).join(' ')} strokeWidth={1.5} />
        </button>

        {isOpen && (
          <div
            id={listboxId}
            role="listbox"
            aria-multiselectable="true"
            className={[
              'absolute left-0 right-0 top-full z-30 mt-2 flex max-h-64 flex-col gap-1 overflow-y-auto rounded-lg border border-border/80 bg-popover p-1 text-sm shadow-lg',
              dropdownClassName,
            ].filter(Boolean).join(' ')}
          >
            {options.map((option) => {
              const isSelected = values.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  className={[
                    'flex w-full cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-left',
                    'hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50',
                    isSelected && 'bg-muted text-foreground',
                  ].filter(Boolean).join(' ')}
                  onClick={() => toggleOption(option)}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check className="size-4 shrink-0" strokeWidth={1.5} />}
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
    <FormBooleanField
      label={label}
      caption={caption}
      required={required}
      checked={checked}
      disabled={disabled}
      variant="toggle"
      className={className}
      onCheckedChange={onCheckedChange}
    />
  );
}

export function FormRadioField({
  checked,
  disabled = false,
  ariaLabel,
  className,
  onCheckedChange,
}: FormRadioFieldProps) {
  return (
    <FormBooleanField
      variant="radio-checkbox"
      checked={checked}
      disabled={disabled}
      ariaLabel={ariaLabel}
      className={className}
      onCheckedChange={onCheckedChange}
    />
  );
}

export function FormNativeRadioField({
  name,
  value,
  checked,
  disabled = false,
  ariaLabel,
  className,
  onCheckedChange,
}: FormNativeRadioFieldProps) {
  return (
    <FormBooleanField
      variant="radio"
      name={name}
      value={value}
      checked={checked}
      disabled={disabled}
      ariaLabel={ariaLabel}
      className={className}
      onCheckedChange={onCheckedChange}
    />
  );
}

export function FormBooleanField({
  label,
  ariaLabel,
  caption,
  required = false,
  checked,
  disabled = false,
  indeterminate = false,
  variant = 'checkbox',
  name,
  value,
  className,
  onCheckedChange,
}: FormBooleanFieldProps) {
  if (variant === 'radio') {
    if (!name) {
      throw new Error('FormBooleanField with variant="radio" requires name');
    }

    const control = (
      <span
        className={[
          'relative inline-flex size-4 shrink-0',
          disabled && 'cursor-not-allowed opacity-50',
          !label && className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          required={required}
          disabled={disabled}
          aria-label={ariaLabel}
          className="peer absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
          onChange={() => onCheckedChange(true)}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none flex size-4 items-center justify-center rounded-full border border-border/80 bg-background after:size-2 after:rounded-full after:bg-primary after:opacity-0 peer-checked:border-primary peer-checked:after:opacity-100 peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50"
        />
      </span>
    );

    if (!label) return control;

    return (
      <FormFieldRoot
        label={label}
        caption={caption}
        required={required}
        className={className}
      >
        {control}
      </FormFieldRoot>
    );
  }

  const control = (
    <button
      type="button"
      role={variant === 'toggle' ? 'switch' : 'checkbox'}
      aria-label={ariaLabel}
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-required={required}
      disabled={disabled}
      className={[
        variant === 'toggle'
          ? 'flex w-full cursor-pointer items-center justify-between gap-4 rounded-lg border border-border/80 bg-background px-3 py-2 text-left text-sm hover:border-ring'
          : 'inline-flex size-4 shrink-0 cursor-pointer items-center justify-center border border-border/80 bg-background',
        variant === 'radio-checkbox' ? 'rounded-full' : 'rounded',
        variant === 'checkbox' && 'text-primary-foreground',
        variant === 'checkbox' &&
          (checked || indeterminate) &&
          'border-primary bg-primary',
        variant === 'radio-checkbox' &&
          checked &&
          'border-primary after:size-2 after:rounded-full after:bg-primary',
        'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        !label && className,
      ].filter(Boolean).join(' ')}
      onClick={() => onCheckedChange(!checked)}
    >
      {variant === 'toggle' ? (
        <>
          <span className="text-muted-foreground">
            {checked ? 'Включено' : 'Выключено'}
          </span>

          <span
            className={[
              'flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 ',
              checked ? 'bg-primary' : 'bg-muted',
            ].filter(Boolean).join(' ')}
          >
            <span
              className={[
                'size-5 rounded-full bg-background shadow-sm ',
                checked && 'translate-x-5',
              ].filter(Boolean).join(' ')}
            />
          </span>
        </>
      ) : variant === 'radio-checkbox' ? null : (
        indeterminate ? (
          <span
            aria-hidden="true"
            className="block h-0.5 w-2 bg-current"
          />
        ) : (
          checked && <Check aria-hidden="true" className="size-3" strokeWidth={3} />
        )
      )}
    </button>
  );

  if (!label) {
    return control;
  }

  return (
    <FormFieldRoot
      label={label}
      caption={caption}
      required={required}
      className={className}
    >
      {control}
    </FormFieldRoot>
  );
}

export function FormImageFileField({
  name,
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
  const hasPreview = Boolean(file || previewUrl);

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
          <div className="overflow-hidden rounded-xl border border-border/80 bg-muted/30">
            <div className="relative aspect-video bg-muted">
              {file ? (
                <ObjectUrlImage
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  file={file}
                  alt="Предпросмотр изображения"
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Предпросмотр изображения"
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/80 px-3 py-2">
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
                className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
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
          className={[
            FILE_DROPZONE_CLASS_NAME,
            disabled && 'pointer-events-none cursor-not-allowed opacity-50',
          ].filter(Boolean).join(' ')}
        >
          <input
            id={inputId}
            name={name}
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
  name,
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
                className="overflow-hidden rounded-xl border border-border/80 bg-muted/30"
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
                    className="absolute right-2 top-2 inline-flex size-7 cursor-pointer items-center justify-center rounded-md bg-background/90 text-muted-foreground shadow-sm hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => removeExistingImage(index)}
                  >
                    <X className="size-4" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="border-t border-border/80 px-3 py-2 text-xs text-muted-foreground">
                  Текущее изображение #{index + 1}
                </div>
              </div>
            ))}

            {files.map((file, index) => (
              <div
                key={`${file.name}-${file.size}-${index}`}
                className="overflow-hidden rounded-xl border border-border/80 bg-muted/30"
              >
                <div className="relative aspect-video bg-muted">
                  <ObjectUrlImage
                    key={`${file.name}-${file.size}-${file.lastModified}`}
                    file={file}
                    alt="Новое изображение продукта"
                    className="h-full w-full object-cover"
                  />

                  <button
                    type="button"
                    disabled={disabled}
                    aria-label="Удалить изображение"
                    className="absolute right-2 top-2 inline-flex size-7 cursor-pointer items-center justify-center rounded-md bg-background/90 text-muted-foreground shadow-sm hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => removeFile(index)}
                  >
                    <X className="size-4" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="border-t border-border/80 px-3 py-2 text-xs text-muted-foreground">
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
          className={[
            FILE_DROPZONE_CLASS_NAME,
            disabled && 'pointer-events-none cursor-not-allowed opacity-50',
          ].filter(Boolean).join(' ')}
        >
          <input
            id={inputId}
            name={name}
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
