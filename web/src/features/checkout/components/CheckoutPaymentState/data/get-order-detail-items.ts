import type { Order } from '@/entities/order';

export type OrderDetailItem = {
  label: string;
  value: string;
};

const orderDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'long',
});

export function getOrderDetailItems(order: Order): OrderDetailItem[] {
  return [
    {
      label: 'Дата заказа',
      value: orderDateFormatter.format(new Date(order.createdAt)),
    },
    {
      label: 'Статус',
      value: 'Ожидает оплаты',
    },
    {
      label: 'Имя',
      value: order.customerName,
    },
    {
      label: 'Телефон',
      value: order.customerPhone,
    },
    {
      label: 'Доставка',
      value: order.delivery.destination?.fullAddress ?? order.deliveryAddress,
    },
    {
      label: 'Продавец и получатель оплаты',
      value: 'ИП Филатов Денис Романович',
    },
  ];
}
