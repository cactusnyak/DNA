import type { Order } from '@/entities/order';
import { formatPrice } from '@/shared/utils/format-price';

import { getOrderDetailItems } from '../../data';
import { OrderItemsList } from '../OrderItemsList';

type OrderDetailsTableProps = {
  order: Order;
};

export function OrderDetailsTable({ order }: OrderDetailsTableProps) {
  const detailItems = getOrderDetailItems(order);

  return (
    <table className="w-full text-sm">
      <tbody>
        {detailItems.map((item) => (
          <tr
            key={item.label}
            className="border-b border-border/80"
          >
            <td className="py-3 text-muted-foreground">{item.label}</td>
            <td className="py-3">{item.value}</td>
          </tr>
        ))}
        <tr className="border-b border-border/80">
          <td className="py-3 align-top text-muted-foreground">
            Состав заказа
          </td>
          <td className="py-3">
            <OrderItemsList items={order.items} />
          </td>
        </tr>
        <tr>
          <td className="py-3 text-muted-foreground">Сумма товаров</td>
          <td className="py-3">
            {formatPrice(order.delivery.pricing.itemsSubtotal)}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
