import { OrderItemsList, type Order } from '@/entities/order';
import { formatPrice } from '@/shared/utils/format-price';

type OrderContentsProps = Pick<Order, 'items'> & {
  itemsSubtotal: number;
};

export function OrderContents({ items, itemsSubtotal }: OrderContentsProps) {
  return (
    <div className='flex flex-col gap-4'>
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Состав заказа</h2>
        <OrderItemsList items={items} />
      </div>

      <div className="flex items-center gap-4 border-t border-border/80 pt-3">
        <h2 className="text-lg font-semibold">
          Сумма товаров:{' '}
          <span className="font-semibold text-primary">
            {formatPrice(itemsSubtotal)}
          </span>
        </h2>
      </div>
    </div>
  );
}
