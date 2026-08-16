import { CheckCircle, Clock, XCircle } from 'lucide-react';

export type CheckoutResultStatus = 'success' | 'pending' | 'failed';

export const checkoutResultStatusConfig = {
  success: {
    icon: CheckCircle,
    color: 'text-green-500',
    title: 'Оплата прошла успешно',
    description: 'Платёж принят, заказ передан в обработку.',
  },
  pending: {
    icon: Clock,
    color: 'text-yellow-500',
    title: 'Проверяем платёж',
    description: 'Подтверждение ещё не получено. Обычно это занимает несколько секунд.',
  },
  failed: {
    icon: XCircle,
    color: 'text-destructive',
    title: 'Оплата не прошла',
    description: 'Платёж отменён. Вы можете повторить оплату заказа.',
  },
} satisfies Record<CheckoutResultStatus, object>;
