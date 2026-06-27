import type {
  ChangeEvent,
  ComponentProps,
  HTMLInputTypeAttribute,
  ReactNode,
} from 'react';

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

const TEXTAREA_CLASS_NAME =
  'w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm leading-5 outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50';

function FormFieldRoot({
  label,
  caption,
  required = false,
  className,
  children,
}: FormFieldRootProps) {
  return (
    <label className={cn('block space-y-1.5', className)}>
      <span
        className={cn(
          'text-sm font-medium',
          required &&
            "after:ml-1 after:text-destructive after:content-['*']",
        )}
      >
        {label}
      </span>

      {children}

      {caption && (
        <span className="block text-xs leading-5 text-muted-foreground">
          {caption}
        </span>
      )}
    </label>
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