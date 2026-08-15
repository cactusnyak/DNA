import { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import {
  FormInputField,
  FormTextareaField,
  FormToggleField,
} from '@/components/ui/FormField';
import { ResourceLink } from '@/components/ui/ResourceLink';
import { useAuthStore } from '@/entities/auth';
import {
  acceptDeliveryQuote,
  createDeliveryQuote,
  getDeliveryQuote,
  type DeliveryQuote,
} from '@/entities/delivery-quote';
import type { Product } from '@/entities/product';
import { useSessionStore } from '@/entities/session';
import {
  OVERSIZED_DELIVERY_INFO_HREF,
  OVERSIZED_MANAGER_URL,
} from '@/shared/config/oversized-delivery';
import { formatPrice } from '@/shared/utils/format-price';

type Props = {
  product: Product;
  cartLineKey: string;
  quantity?: number;
  configuredUnitPrice?: number;
  initialQuote?: DeliveryQuote;
  onQuoteChange?: (quote?: DeliveryQuote) => void;
};

export function OversizedDeliveryCalculator({
  product,
  cartLineKey,
  quantity = 1,
  configuredUnitPrice = product.price,
  initialQuote,
  onQuoteChange,
}: Props) {
  const token = useAuthStore((state) => state.accessToken);
  const guestSessionId = useSessionStore((state) => state.guestSessionId);
  const clientRequestId = useRef(crypto.randomUUID());

  const quote = initialQuote;
  const [form, setForm] = useState({
    destinationRegion: '',
    destinationCity: '',
    destinationAddress: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerComment: '',
    unloadingRequired: false,
    accessRestrictions: '',
  });

  const mutation = useMutation({
    mutationFn: () =>
      createDeliveryQuote(
        {
          ...form,
          productId: product.id,
          cartLineKey,
          guestSessionId,
          clientRequestId: clientRequestId.current,
          quantity,
        },
        token,
      ),
    onSuccess: (value) => {
      onQuoteChange?.(value);
    },
  });

  const refresh = useMutation({
    mutationFn: () => getDeliveryQuote(quote!.id, guestSessionId, token),
    onSuccess: (value) => {
      onQuoteChange?.(value);
    },
  });

  const accept = useMutation({
    mutationFn: () => acceptDeliveryQuote(quote!.id, guestSessionId, token),
    onSuccess: (value) => {
      onQuoteChange?.(value);
    },
  });

  if (!product.location) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-primary/12 p-4">
        <p className="text-sm text-muted-foreground">
          Место отправления не указано, поэтому создать запрос на сайте пока
          нельзя.
        </p>

        <ManagerLinks />
      </div>
    );
  }

  if (quote) {
    return (
      <div
        className="flex flex-col gap-3 rounded-xl border border-primary/12 p-4"
        aria-live="polite"
      >
        <h2 className="font-semibold">Индивидуальный расчёт доставки</h2>

        <p className="text-sm">
          Статус:{' '}
          {quote.status === 'PENDING'
            ? 'ожидает расчёта менеджером'
            : quote.status === 'QUOTED'
              ? 'цена рассчитана'
              : quote.status === 'ACCEPTED'
                ? 'расчёт принят'
                : quote.status === 'EXPIRED'
                  ? 'срок расчёта истёк'
                  : 'расчёт отменён'}
        </p>

        {quote.confirmedDeliveryPrice != null && (
          <>
            <p className="text-sm">
              Товары: {formatPrice(configuredUnitPrice * quantity)}
            </p>

            <p className="font-semibold">
              Доставка: {formatPrice(quote.confirmedDeliveryPrice)}
            </p>

            <p className="font-semibold">
              Итого:{' '}
              {formatPrice(
                configuredUnitPrice * quantity + quote.confirmedDeliveryPrice,
              )}
            </p>
          </>
        )}

        {quote.managerComment && (
          <p className="text-sm text-muted-foreground">
            Комментарий менеджера: {quote.managerComment}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {(quote.status === 'EXPIRED' || quote.status === 'CANCELLED') && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                clientRequestId.current = crypto.randomUUID();
                onQuoteChange?.(undefined);
              }}
            >
              Создать новый расчёт
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            onClick={() => refresh.mutate()}
            disabled={refresh.isPending}
          >
            Проверить расчёт
          </Button>

          {quote.status === 'QUOTED' && (
            <Button
              type="button"
              onClick={() => accept.mutate()}
              disabled={accept.isPending}
            >
              Принять расчёт
            </Button>
          )}
        </div>

        <ManagerLinks />
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate();
      }}
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-semibold">Рассчитать крупногабаритную доставку</h2>

        <p className="text-sm text-muted-foreground">
          Отправление: {product.location.name}. Стоимость подтвердит менеджер.
        </p>
      </div>

      <FormInputField
        name="dispatchLocation"
        label="Место отправления"
        value={product.location.name}
        disabled
        caption="Определяется по местоположению товара."
        onChange={() => undefined}
      />

      <FormInputField
        name="destinationRegion"
        label="Регион"
        required
        value={form.destinationRegion}
        autoComplete="address-level1"
        onChange={(event) =>
          setForm({ ...form, destinationRegion: event.target.value })
        }
      />

      <FormInputField
        name="destinationCity"
        label="Город или населённый пункт"
        required
        value={form.destinationCity}
        autoComplete="address-level2"
        onChange={(event) =>
          setForm({ ...form, destinationCity: event.target.value })
        }
      />

      <FormInputField
        name="destinationAddress"
        label="Адрес или ориентир"
        required
        value={form.destinationAddress}
        autoComplete="street-address"
        onChange={(event) =>
          setForm({ ...form, destinationAddress: event.target.value })
        }
      />

      <FormInputField
        name="customerName"
        label="Имя"
        required
        value={form.customerName}
        autoComplete="name"
        onChange={(event) =>
          setForm({ ...form, customerName: event.target.value })
        }
      />

      <FormInputField
        name="customerPhone"
        label="Телефон"
        type="tel"
        inputMode="tel"
        required
        value={form.customerPhone}
        autoComplete="tel"
        onChange={(event) =>
          setForm({ ...form, customerPhone: event.target.value })
        }
      />

      <FormInputField
        name="customerEmail"
        label="Email"
        type="email"
        value={form.customerEmail}
        autoComplete="email"
        onChange={(event) =>
          setForm({ ...form, customerEmail: event.target.value })
        }
      />

      <FormTextareaField
        name="accessRestrictions"
        label="Ограничения для транспорта"
        caption="Например, узкий подъезд, ограничение по высоте или пропускной режим."
        rows={3}
        value={form.accessRestrictions}
        onChange={(event) =>
          setForm({ ...form, accessRestrictions: event.target.value })
        }
      />

      <FormTextareaField
        name="customerComment"
        label="Комментарий"
        rows={4}
        value={form.customerComment}
        onChange={(event) =>
          setForm({ ...form, customerComment: event.target.value })
        }
      />

      <FormToggleField
        label="Нужна разгрузка"
        caption="Менеджер учтёт разгрузку при подготовке расчёта."
        checked={form.unloadingRequired}
        onCheckedChange={(unloadingRequired) =>
          setForm({ ...form, unloadingRequired })
        }
      />

      {mutation.isError && (
        <p className="text-sm text-destructive">
          Не удалось отправить запрос. Проверьте поля и попробуйте снова.
        </p>
      )}

      <Button variant="accent" type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Отправляем…' : 'Отправить запрос на расчёт'}
      </Button>

      <ManagerLinks />
    </form>
  );
}

function ManagerLinks() {
  return (
    <div className="flex flex-wrap gap-2.5 text-sm">
      <ResourceLink href={OVERSIZED_MANAGER_URL}>
        Связаться с менеджером
      </ResourceLink>

      <span
        aria-hidden="true"
        className="h-4 w-px shrink-0 self-center bg-border"
      />

      <Link
        to={OVERSIZED_DELIVERY_INFO_HREF}
        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Условия доставки
      </Link>
    </div>
  );
}
