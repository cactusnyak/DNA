import type { ChangeEvent, FormEvent } from 'react';

import { Button } from '@/components/ui/Button';
import {
  FormInputField,
  FormTextareaField,
} from '@/components/ui/FormField';

import type { CheckoutFormValue } from '../../types/checkout-form';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LegalFormNotice } from '@/shared/legal/LegalFormNotice';

type CheckoutCustomerFormProps = {
  value: CheckoutFormValue;
  isPending?: boolean;
  isSubmitDisabled?: boolean;
  errorMessage?: string;
  onChange: (value: CheckoutFormValue) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

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
      <section className="flex flex-col gap-6 rounded-2xl shadow-card-lg bg-card p-5 sm:p-6">
        <header className="space-y-1.5">
          <h2 className="text-lg font-semibold">Контактные данные</h2>

          <p className="text-sm leading-6 text-muted-foreground">
            Аккаунт создавать не нужно. Оставьте контакты и адрес, чтобы мы
            могли уточнить дальнейшее оформление. Доставка пока не подключена.
          </p>
        </header>

        <div className="grid gap-4">
          <FormInputField
            name="customerName"
            required
            label="Имя"
            value={value.customerName}
            placeholder=""
            onChange={getInputChangeHandler('customerName')}
          />

          <FormInputField
            name="customerPhone"
            required
            type="tel"
            label="Телефон"
            value={value.customerPhone}
            placeholder="+7 000 000-00-00"
            onChange={getInputChangeHandler('customerPhone')}
          />

          <FormInputField
            name="customerEmail"
            required
            type="email"
            label="Email"
            value={value.customerEmail}
            placeholder="Для отправки электронного чека"
            onChange={getInputChangeHandler('customerEmail')}
          />

          <FormInputField
            name="deliveryAddress"
            required
            label="Адрес доставки"
            value={value.deliveryAddress}
            placeholder="Город, улица, дом, квартира"
            onChange={getInputChangeHandler('deliveryAddress')}
          />

          <FormTextareaField
            name="comment"
            label="Комментарий"
            value={value.comment}
            placeholder="Необязательно"
            onChange={getTextareaChangeHandler('comment')}
          />
        </div>

        {errorMessage && (
          <ErrorMessage variant="banner">
            {errorMessage}
          </ErrorMessage>
        )}

        <Button
          type="submit"
          variant="accent"
          size="lg"
          className="w-full"
          disabled={isSubmitDisabled || isPending}
        >
          {isPending ? 'Оформляем заказ...' : 'Подтвердить заказ'}
        </Button>

        <LegalFormNotice />
      </section>
    </form>
  );
}
