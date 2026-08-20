import { OrderItemsList, type Order } from '@/entities/order';
import { formatPrice } from '@/shared/utils/format-price';

type OrderContentsProps = Pick<Order, 'items' | 'totalAmount'>;

export function OrderContents({ items, totalAmount }: OrderContentsProps) {
  return (
    <div className='flex flex-col gap-4'>
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Состав заказа</h2>
        <OrderItemsList items={items} />
      </div>

      <div className="flex items-center gap-4 border-t border-border/80 pt-3">
        <h2 className="text-lg font-semibold">Итог: <span className="font-semibold text-primary">{formatPrice(totalAmount)}</span></h2>
      </div>
    </div>
  );
}
