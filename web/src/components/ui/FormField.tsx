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
import { Check, ChevronDown } from 'lucide-react';

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

const TEXTAREA_CLASS_NAME =
  'w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm leading-5 outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50';

const SELECT_TRIGGER_CLASS_NAME =
  'flex h-10 w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-left text-sm outline-none transition-colors hover:border-ring focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50';

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