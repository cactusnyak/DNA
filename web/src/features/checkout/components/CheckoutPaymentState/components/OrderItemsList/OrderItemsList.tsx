import type { Order } from '@/entities/order';
import { formatPrice } from '@/shared/utils/format-price';

type OrderItemsListProps = {
  items: Order['items'];
};

export function OrderItemsList({ items }: OrderItemsListProps) {
  return (
    <div className="space-y-2">
      <h2 className="font-semibold">Состав заказа</h2>
      <ul className="space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4">
            <span>
              {item.product?.title ?? `Товар ${item.productId}`} ×{' '}
              {item.quantity}
            </span>
            <span className="shrink-0">
              {formatPrice(
                item.unitPrice * item.quantity + item.deliveryPrice,
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
