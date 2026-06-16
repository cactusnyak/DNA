import type { OrderStatus } from '../types/order-status';

const orderStatusLabels: Record<OrderStatus, string> = {
  CREATED: 'Создан',
  AWAITING_PAYMENT: 'Ожидает оплаты',
  PAID: 'Оплачен',
  SHIPPED: 'Отправлен',
  DELIVERED: 'Доставлен',
  CASHBACK_ACCRUED: 'Кешбэк начислен',
  CANCELLED: 'Отменён',
};

export function formatOrderStatus(status: OrderStatus) {
  return orderStatusLabels[status] ?? status;
}