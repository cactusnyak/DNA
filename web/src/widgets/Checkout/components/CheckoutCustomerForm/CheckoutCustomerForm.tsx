import type { FormEvent } from 'react';

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

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Контактные данные</h2>

          <p className="text-sm text-muted-foreground">
            Аккаунт создавать не нужно. Оставьте данные для связи и доставки.
          </p>
        </div>

        <div className="mt-5 grid gap-4">
          <label className="space-y-1.5">
            <span className="text-sm font-medium">Имя</span>

            <div className="h-10 rounded-lg border border-border bg-background px-3">
              <Input
                required
                value={value.customerName}
                placeholder="Например, Фёдор"
                onChange={(event) =>
                  updateField('customerName', event.target.value)
                }
              />
            </div>
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium">Телефон</span>

            <div className="h-10 rounded-lg border border-border bg-background px-3">
              <Input
                required
                type="tel"
                value={value.customerPhone}
                placeholder="+7 000 000-00-00"
                onChange={(event) =>
                  updateField('customerPhone', event.target.value)
                }
              />
            </div>
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium">Email</span>

            <div className="h-10 rounded-lg border border-border bg-background px-3">
              <Input
                type="email"
                value={value.customerEmail}
                placeholder="Необязательно"
                onChange={(event) =>
                  updateField('customerEmail', event.target.value)
                }
              />
            </div>
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium">Адрес доставки</span>

            <div className="h-10 rounded-lg border border-border bg-background px-3">
              <Input
                required
                value={value.deliveryAddress}
                placeholder="Город, улица, дом, квартира"
                onChange={(event) =>
                  updateField('deliveryAddress', event.target.value)
                }
              />
            </div>
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium">Комментарий</span>

            <textarea
              value={value.comment}
              placeholder="Необязательно"
              rows={4}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50"
              onChange={(event) => updateField('comment', event.target.value)}
            />
          </label>
        </div>
      </div>

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