import type {
  ChangeEvent,
  FormEvent,
  HTMLInputTypeAttribute,
} from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

import type { CheckoutFormValue } from '../../types/checkout-form';

type CheckoutCustomerFormProps = {
  value: CheckoutFormValue;
  isPending?: boolean;
  isSubmitDisabled?: boolean;
  errorMessage?: string;
  onChange: (value: CheckoutFormValue) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

type CheckoutInputFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  required?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

type CheckoutTextareaFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
};

function CheckoutInputField({
  label,
  value,
  placeholder,
  type = 'text',
  required = false,
  onChange,
}: CheckoutInputFieldProps) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>

      <Input
        required={required}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
      />
    </label>
  );
}

function CheckoutTextareaField({
  label,
  value,
  placeholder,
  onChange,
}: CheckoutTextareaFieldProps) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>

      <textarea
        value={value}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm leading-5 outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
        onChange={onChange}
      />
    </label>
  );
}

export function CheckoutCustomerForm({
  value,
  isPending = false,
  isSubmitDisabled = false,
  errorMessage,
  onChange,
  onSubmit,
}: CheckoutCustomerFormProps) {
  function updateField(field: keyof CheckoutFormValue, fieldValue: string) {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  }

  function getInputChangeHandler(field: keyof CheckoutFormValue) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      updateField(field, event.target.value);
    };
  }

  function getTextareaChangeHandler(field: keyof CheckoutFormValue) {
    return (event: ChangeEvent<HTMLTextAreaElement>) => {
      updateField(field, event.target.value);
    };
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <header className="space-y-1.5">
          <h2 className="text-lg font-semibold">Контактные данные</h2>

          <p className="text-sm leading-6 text-muted-foreground">
            Аккаунт создавать не нужно. Оставьте данные для связи и доставки.
          </p>
        </header>

        <div className="mt-6 grid gap-4">
          <CheckoutInputField
            required
            label="Имя"
            value={value.customerName}
            placeholder="Например, Фёдор"
            onChange={getInputChangeHandler('customerName')}
          />

          <CheckoutInputField
            required
            type="tel"
            label="Телефон"
            value={value.customerPhone}
            placeholder="+7 000 000-00-00"
            onChange={getInputChangeHandler('customerPhone')}
          />

          <CheckoutInputField
            type="email"
            label="Email"
            value={value.customerEmail}
            placeholder="Необязательно"
            onChange={getInputChangeHandler('customerEmail')}
          />

          <CheckoutInputField
            required
            label="Адрес доставки"
            value={value.deliveryAddress}
            placeholder="Город, улица, дом, квартира"
            onChange={getInputChangeHandler('deliveryAddress')}
          />

          <CheckoutTextareaField
            label="Комментарий"
            value={value.comment}
            placeholder="Необязательно"
            onChange={getTextareaChangeHandler('comment')}
          />
        </div>
      </section>

      {errorMessage && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitDisabled || isPending}
      >
        {isPending ? 'Оформляем заказ...' : 'Подтвердить заказ'}
      </Button>
    </form>
  );
}