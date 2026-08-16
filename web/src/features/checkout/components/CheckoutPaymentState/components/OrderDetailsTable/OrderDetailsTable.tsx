import type { Order } from '@/entities/order';

import { getOrderDetailItems } from '../../data';

type OrderDetailsTableProps = {
  order: Order;
};

export function OrderDetailsTable({ order }: OrderDetailsTableProps) {
  return (
    <table className="w-full text-sm">
      <tbody>
        {getOrderDetailItems(order).map((item) => (
          <tr
            key={item.label}
            className={
              item.startsSection
                ? 'border-t border-border/80'
                : item.endsSection
                  ? 'border-b border-border/80'
                  : undefined
            }
          >
            <td className="py-3 text-muted-foreground">{item.label}</td>
            <td className="py-3">{item.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
