import type { Order } from '@/entities/order';
import { formatPrice } from '@/shared/utils/format-price';

export type OrderDetailItem = {
  label: string;
  value: string;
};

const orderDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'long',
});

export function getOrderDetailItems(order: Order): OrderDetailItem[] {
  const pricing = order.delivery.pricing;
  return [
    {
      label: 'Дата заказа',
      value: orderDateFormatter.format(new Date(order.createdAt)),
    },
    ...(pricing.oversizedDeliveryAmount > 0 ? [{ label: 'Крупногабаритная доставка', value: formatPrice(pricing.oversizedDeliveryAmount) }] : []),
    ...(pricing.automatedDeliveryAmount > 0 ? [{ label: 'Автоматическая доставка', value: formatPrice(pricing.automatedDeliveryAmount) }] : []),
    ...(pricing.deliveryAmount > 0 ? [{ label: 'Доставка всего', value: formatPrice(pricing.deliveryAmount) }] : []),
    { label: 'Итого к оплате', value: formatPrice(pricing.totalAmount) },
    {
      label: 'Статус',
      value: 'Ожидает оплаты',
    },
    {
      label: 'Получатель',
      value: `${order.customerName}, ${order.customerPhone}`,
    },
    {
      label: 'Доставка',
      value: order.deliveryAddress,
    },
    {
      label: 'Продавец и получатель оплаты',
      value: 'ИП Филатов Денис Романович',
    },
  ];
}
