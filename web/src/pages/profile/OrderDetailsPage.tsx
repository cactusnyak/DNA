import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { ContentCard } from '@/components/ui/ContentCard';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/entities/auth';
import { useCartStore, type CartStoreItem } from '@/entities/cart';
import {
  formatOrderStatus,
  getOrder,
  rebuildOrder,
  removeOrder,
} from '@/entities/order';
import {
  calculateProductAdditionsTotal,
  createCartConfigurationKey,
} from '@/entities/product/lib/product-additions';
import { HttpError } from '@/shared/api/http-client';
import { formatPrice } from '@/shared/utils/format-price';

type Confirmation = 'merge' | 'remove';

export function OrderDetailsPage() {
  const { orderId = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken) ?? '';
  const cartItems = useCartStore((state) => state.items);
  const replaceItemsForOrder = useCartStore((state) => state.replaceItemsForOrder);
  const [confirmation, setConfirmation] = useState<Confirmation>();
  const [error, setError] = useState<string>();

  const orderQuery = useQuery({
    queryKey: ['my-order', orderId, accessToken],
    queryFn: () => getOrder(orderId, accessToken),
    enabled: Boolean(accessToken && orderId),
  });

  const rebuildMutation = useMutation({
    mutationFn: () => rebuildOrder(accessToken, orderId),
    onSuccess: (rebuilt) => {
      const merged = [...cartItems];
      for (const source of rebuilt.items) {
        const configurationKey = createCartConfigurationKey(
          source.product.id,
          source.selectedAdditions,
        );
        const index = merged.findIndex((item) => item.configurationKey === configurationKey);
        if (index >= 0) {
          merged[index] = {
            ...merged[index],
            quantity: merged[index].quantity + source.quantity,
            deliveryQuote: undefined,
          };
        } else {
          merged.push({
            product: source.product,
            quantity: source.quantity,
            selectedAdditions: source.selectedAdditions,
            configurationKey,
            configuredUnitPrice:
              source.product.price +
              calculateProductAdditionsTotal(
                source.product.additions ?? [],
                source.selectedAdditions,
              ),
          } satisfies CartStoreItem);
        }
      }
      replaceItemsForOrder(merged, rebuilt.customer);
      navigate('/checkout');
    },
    onError: (cause) => setError(
      cause instanceof HttpError ? cause.message : 'Не удалось восстановить заказ.',
    ),
  });

  const removeMutation = useMutation({
    mutationFn: () => removeOrder(accessToken, orderId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      navigate('/profile');
    },
    onError: (cause) => setError(
      cause instanceof HttpError ? cause.message : 'Не удалось изменить заказ.',
    ),
  });

  if (orderQuery.isPending) return <ContentCard>Загружаем заказ…</ContentCard>;
  if (orderQuery.isError || !orderQuery.data) {
    return <ContentCard><ErrorMessage>Заказ не найден или недоступен.</ErrorMessage><Link to="/profile" className="mt-4 inline-block underline">Вернуться в профиль</Link></ContentCard>;
  }
  const order = orderQuery.data;
  const beginMerge = () => cartItems.length ? setConfirmation('merge') : rebuildMutation.mutate();
  const continueCheckout = () => {
    if (order.status === 'AWAITING_PAYMENT') {
      navigate(`/checkout?orderId=${order.id}`);
      return;
    }
    beginMerge();
  };

  return (
    <ContentCard>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Заказ № {order.id.slice(0, 8)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{formatOrderStatus(order.status)} · {new Date(order.createdAt).toLocaleString('ru-RU')}</p>
        </div>
        <strong>{formatPrice(order.totalAmount)}</strong>
      </div>

      <div className="mt-6 grid gap-3">
        {order.items.map((item) => (
          <article key={item.id} className="rounded-xl border border-border/80 p-4">
            <div className="flex justify-between gap-3"><strong>{item.productTitle ?? item.product?.title ?? item.productId}</strong><span>{item.quantity} × {formatPrice(item.unitPrice)}</span></div>
            {item.selectedAdditions.length > 0 && <ul className="mt-2 text-sm text-muted-foreground">{item.selectedAdditions.map((addition) => <li key={addition.additionId}>{addition.title}: {typeof addition.value === 'boolean' ? (addition.value ? 'да' : 'нет') : addition.value}</li>)}</ul>}
            {item.deliveryPrice > 0 && <p className="mt-2 text-sm">Доставка: {formatPrice(item.deliveryPrice)}</p>}
          </article>
        ))}
      </div>

      <dl className="mt-6 grid gap-2 text-sm sm:grid-cols-[180px_1fr]">
        <dt className="text-muted-foreground">Получатель</dt><dd>{order.customerName}, {order.customerPhone}</dd>
        <dt className="text-muted-foreground">Email</dt><dd>{order.customerEmail || '—'}</dd>
        <dt className="text-muted-foreground">Адрес доставки</dt><dd>{order.deliveryAddress}</dd>
        <dt className="text-muted-foreground">Комментарий</dt><dd>{order.comment || '—'}</dd>
      </dl>

      <p className="mt-6 text-sm text-muted-foreground">При повторе применяются текущие цены и доступные параметры. Исходный заказ останется без изменений.</p>
      {error && <ErrorMessage className="mt-3" role="alert">{error}</ErrorMessage>}
      <div className="mt-5 flex flex-wrap gap-3">
        {order.capabilities.canContinue && <Button type="button" onClick={continueCheckout} disabled={rebuildMutation.isPending}>{order.status === 'AWAITING_PAYMENT' ? 'Перейти к оплате' : 'Продолжить оформление'}</Button>}
        {!order.capabilities.canContinue && order.capabilities.canRepeat && <Button type="button" onClick={beginMerge} disabled={rebuildMutation.isPending}>Повторить заказ</Button>}
        {order.capabilities.canRemove && <Button type="button" variant="secondary" onClick={() => setConfirmation('remove')}>{order.capabilities.removeAction === 'delete' ? 'Удалить черновик' : 'Отменить заказ'}</Button>}
        <Button type="button" variant="ghost" onClick={() => navigate('/profile')}>Назад</Button>
      </div>

      <Modal isOpen={Boolean(confirmation)} title={confirmation === 'merge' ? 'Добавить товары заказа?' : order.capabilities.removeAction === 'delete' ? 'Удалить черновик?' : 'Отменить заказ?'} size="sm" onClose={() => setConfirmation(undefined)}>
        <div className="flex flex-col gap-5 overflow-auto p-5">
          <p className="text-sm text-muted-foreground">{confirmation === 'merge' ? 'Текущая корзина будет сохранена. Позиции заказа добавятся к ней, а количество полностью совпадающих позиций увеличится.' : 'Это действие изменит состояние заказа. Текущая корзина останется без изменений.'}</p>
          <div className="flex gap-3"><Button type="button" onClick={() => { const action = confirmation; setConfirmation(undefined); if (action === 'merge') rebuildMutation.mutate(); else removeMutation.mutate(); }}>Подтвердить</Button><Button type="button" variant="secondary" onClick={() => setConfirmation(undefined)}>Отмена</Button></div>
        </div>
      </Modal>
    </ContentCard>
  );
}
