import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { ContentCard } from '@/components/ui/ContentCard';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { OrderTotal } from '@/components/ui/OrderTotal';
import { useAuthStore } from '@/entities/auth';
import { useCartStore, type CartStoreItem } from '@/entities/cart';
import {
  getOrder,
  rebuildOrder,
  removeOrder,
} from '@/entities/order';
import {
  calculateProductAdditionsTotal,
  createCartConfigurationKey,
} from '@/entities/product/lib/product-additions';
import { HttpError } from '@/shared/api/http-client';
import {
  OrderActions,
  OrderConfirmationModal,
  OrderContents,
  OrderCustomerDetails,
  OrderDeliveryDetails,
  OrderDetailsHeader,
} from './components/OrderDetails';

export function OrderDetailsPage() {
  const { orderId = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken) ?? '';
  const cartItems = useCartStore((state) => state.items);
  const replaceItemsForOrder = useCartStore((state) => state.replaceItemsForOrder);
  const [isMergeConfirmationOpen, setIsMergeConfirmationOpen] = useState(false);
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
    return <ContentCard><div className="flex flex-col gap-4"><ErrorMessage>Заказ не найден или недоступен.</ErrorMessage><Link to="/profile" className="inline-block underline">Вернуться в профиль</Link></div></ContentCard>;
  }
  const order = orderQuery.data;
  const beginMerge = () => cartItems.length ? setIsMergeConfirmationOpen(true) : rebuildMutation.mutate();
  const continueCheckout = () => {
    if (order.status === 'AWAITING_PAYMENT') {
      navigate(`/checkout?orderId=${order.id}`);
      return;
    }
    beginMerge();
  };
  const confirmRemove = () => {
    const message = order.capabilities.removeAction === 'delete'
      ? 'Удалить черновик?'
      : 'Отменить заказ?';
    if (window.confirm(message)) removeMutation.mutate();
  };

  return (
    <ContentCard>
      <div className="flex flex-col gap-6">
        <OrderDetailsHeader
          id={order.id}
          status={order.status}
          createdAt={order.createdAt}
        />
        <OrderCustomerDetails customer={order} />
        <OrderContents
          items={order.items}
          itemsSubtotal={order.delivery.pricing.itemsSubtotal}
        />
        <OrderDeliveryDetails delivery={order.delivery} />
        <OrderTotal amount={order.delivery.pricing.totalAmount} />
        <OrderActions
          order={order}
          error={error}
          isRebuilding={rebuildMutation.isPending}
          onContinue={continueCheckout}
          onRepeat={beginMerge}
          onRemove={confirmRemove}
        />
        <OrderConfirmationModal
          isOpen={isMergeConfirmationOpen}
          onClose={() => setIsMergeConfirmationOpen(false)}
          onConfirm={() => {
            setIsMergeConfirmationOpen(false);
            rebuildMutation.mutate();
          }}
        />
      </div>
    </ContentCard>
  );
}
