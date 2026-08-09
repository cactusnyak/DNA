import type { Order } from '@/entities/order';
import { formatPrice } from '@/shared/utils/format-price';

export type OrderDetailItem = {
  label: string;
  value: string;
  startsSection?: boolean;
  endsSection?: boolean;
};

const orderDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'long',
});

export function getOrderDetailItems(order: Order): OrderDetailItem[] {
  return [
    {
      label: 'Дата заказа',
      value: orderDateFormatter.format(new Date(order.createdAt)),
      endsSection: true,
    },
    {
      label: 'Сумма к оплате',
      value: formatPrice(order.totalAmount),
      endsSection: true,
    },
    {
      label: 'Статус',
      value: 'Ожидает оплаты',
    },
    {
      label: 'Получатель',
      value: `${order.customerName}, ${order.customerPhone}`,
      startsSection: true,
    },
    {
      label: 'Доставка',
      value: order.deliveryAddress,
      startsSection: true,
    },
    {
      label: 'Продавец и получатель оплаты',
      value: 'ИП Филатов Денис Романович',
      startsSection: true,
    },
  ];
}
