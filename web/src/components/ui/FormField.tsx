import type {
  ChangeEvent,
  HTMLInputTypeAttribute,
  ReactNode,
} from 'react';

import { cn } from '@/shared/utils/cn';

import { Input } from './Input';

type FormFieldBaseProps = {
  label: ReactNode;
  className?: string;
};

type FormInputFieldProps = FormFieldBaseProps & {
  value: string;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  required?: boolean;
  disabled?: boolean;
  minLength?: number;
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

export function FormInputField({
  label,
  value,
  placeholder,
  type = 'text',
  required = false,
  disabled = false,
  minLength,
  className,
  inputClassName,
  onChange,
}: FormInputFieldProps) {
  return (
    <label className={cn('block space-y-1.5', className)}>
      <span className="text-sm font-medium">{label}</span>

      <Input
        required={required}
        disabled={disabled}
        type={type}
        value={value}
        minLength={minLength}
        placeholder={placeholder}
        className={inputClassName}
        onChange={onChange}
      />
    </label>
  );
}

export function FormTextareaField({
  label,
  value,
  placeholder,
  rows = 4,
  disabled = false,
  className,
  textareaClassName,
  onChange,
}: FormTextareaFieldProps) {
  return (
    <label className={cn('block space-y-1.5', className)}>
      <span className="text-sm font-medium">{label}</span>

      <textarea
        value={value}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          'w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm leading-5 outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
          textareaClassName,
        )}
        onChange={onChange}
      />
    </label>
  );
}