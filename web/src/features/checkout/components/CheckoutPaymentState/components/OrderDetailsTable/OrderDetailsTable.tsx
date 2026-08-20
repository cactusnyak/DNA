import type { Order } from '@/entities/order';

import { getOrderDetailItems } from '../../data';
import { OrderItemsList } from '../OrderItemsList';

type OrderDetailsTableProps = {
  order: Order;
};

export function OrderDetailsTable({ order }: OrderDetailsTableProps) {
  const detailItems = getOrderDetailItems(order);
  const totalItem = detailItems.find(
    (item) => item.label === 'Итого к оплате',
  );
  const orderInfoItems = detailItems.filter(
    (item) => item.label !== 'Итого к оплате',
  );

  return (
    <table className="w-full text-sm">
      <tbody>
        {orderInfoItems.map((item) => (
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
        {totalItem && (
          <tr>
            <td className="py-3 text-muted-foreground">{totalItem.label}</td>
            <td className="py-3">{totalItem.value}</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
